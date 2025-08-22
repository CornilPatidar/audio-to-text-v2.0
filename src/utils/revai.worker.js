import { MessageTypes } from './presets'

// RevAI API Configuration
// Use CORS proxy in production to avoid CORS issues
const isDevelopment = import.meta.env.DEV
const CORS_PROXY = 'https://corsproxy.io/?'

const REVAI_CONFIG = {
    // Use proxy in production, direct proxy in development
    BASE_URL: isDevelopment ? '/api/revai' : `${CORS_PROXY}https://api.rev.ai/speechtotext/v1`,
    POLL_INTERVAL: 2000, // 2 seconds
    MAX_POLL_ATTEMPTS: 150, // 5 minutes max
    SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'webm']
}

// State management for tracking transcription progress
let currentJobId = null      // Current RevAI job ID being processed
let pollInterval = null      // Interval timer for polling job status
let pollAttempts = 0         // Counter for polling attempts

/**
 * Convert audio data to WAV file format for upload
 * RevAI requires audio files to be uploaded, so we convert the raw audio data
 * to a WAV file that can be sent via FormData
 */
function audioDataToFile(audioData, fileName = 'audio.wav') {
    // Audio format specifications for WAV file
    const sampleRate = 16000      // 16kHz sample rate (RevAI requirement)
    const numChannels = 1         // Mono audio
    const bitsPerSample = 16      // 16-bit audio
    
    // Calculate buffer size: 44 bytes for WAV header + 2 bytes per sample
    const buffer = new ArrayBuffer(44 + audioData.length * 2)
    const view = new DataView(buffer)
    
    // Helper function to write strings to the buffer
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }
    
    // Write WAV file header (44 bytes)
    writeString(0, 'RIFF')                                    // Chunk ID
    view.setUint32(4, 36 + audioData.length * 2, true)       // File size
    writeString(8, 'WAVE')                                    // Format
    writeString(12, 'fmt ')                                   // Subchunk1 ID
    view.setUint32(16, 16, true)                             // Subchunk1 size
    view.setUint16(20, 1, true)                              // Audio format (PCM)
    view.setUint16(22, numChannels, true)                    // Number of channels
    view.setUint32(24, sampleRate, true)                     // Sample rate
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true)  // Byte rate
    view.setUint16(32, numChannels * bitsPerSample / 8, true)               // Block align
    view.setUint16(34, bitsPerSample, true)                  // Bits per sample
    writeString(36, 'data')                                   // Subchunk2 ID
    view.setUint32(40, audioData.length * 2, true)           // Subchunk2 size
    
    // Write audio data samples
    let offset = 44
    for (let i = 0; i < audioData.length; i++) {
        // Clamp audio sample to [-1, 1] range and convert to 16-bit integer
        const sample = Math.max(-1, Math.min(1, audioData[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
    }
    
    // Create and return a File object from the buffer
    return new File([buffer], fileName, { type: 'audio/wav' })
}

/**
 * Submit audio file to RevAI for transcription
 * This function uploads the audio file and returns a job ID for tracking
 */
async function submitJob(audioFile) {
    console.log(' [REVAI WORKER] Submitting job to:', `${REVAI_CONFIG.BASE_URL}/jobs`)
    console.log(' [REVAI WORKER] API Key present:', !!REVAI_API_KEY)
    console.log('🌍 [REVAI WORKER] Environment:', isDevelopment ? 'Development' : 'Production')
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('media', audioFile)                       // Audio file
    formData.append('metadata', 'Audio transcription from web app')  // Optional metadata
    
    try {
        // Prepare headers based on environment
        const headers = {
            'Authorization': `Bearer ${REVAI_API_KEY}`    // API authentication
        }
        
        // Send POST request to RevAI API
        const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs`, {
            method: 'POST',
            headers: headers,
            body: formData
        })
        
        console.log('📡 [REVAI WORKER] Response status:', response.status)
        
        // Handle error responses
        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ [REVAI WORKER] Submit job failed:', errorText)
            throw new Error(`Failed to submit job: ${response.status} - ${errorText}`)
        }
        
        // Parse successful response to get job ID
        const job = await response.json()
        console.log('✅ [REVAI WORKER] Job submitted successfully:', job.id)
        return job.id
        
    } catch (error) {
        console.error('❌ [REVAI WORKER] Submit job error:', error)
        throw error
    }
}

/**
 * Check the status of a RevAI transcription job
 * Returns job status information including completion status
 */
async function checkJobStatus(jobId) {
    const headers = {
        'Authorization': `Bearer ${REVAI_API_KEY}`
    }
    
    const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs/${jobId}`, {
        headers: headers
    })
    
    if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.statusText}`)
    }
    
    return await response.json()
}

/**
 * Retrieve the completed transcript from RevAI
 * This is called once the job status is 'transcribed'
 */
async function getTranscript(jobId) {
    const headers = {
        'Authorization': `Bearer ${REVAI_API_KEY}`,
        'Accept': 'application/vnd.rev.transcript.v1.0+json'  // Request transcript format
    }
    
    const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs/${jobId}/transcript`, {
        headers: headers
    })
    
    if (!response.ok) {
        throw new Error(`Failed to get transcript: ${response.statusText}`)
    }
    
    return await response.json()
}

/**
 * Convert Rev AI transcript to our format
 */
function convertTranscript(revTranscript) {
    if (!revTranscript.monologues || revTranscript.monologues.length === 0) {
        return [{
            index: 0,
            text: "No speech detected",
            start: 0,
            end: 0
        }]
    }
    
    const segments = []
    let segmentIndex = 0
    
    revTranscript.monologues.forEach(monologue => {
        let currentSegment = {
            index: segmentIndex,
            text: "",
            start: 0,
            end: 0,
            speaker: monologue.speaker
        }
        
        monologue.elements.forEach(element => {
            if (element.type === 'text') {
                currentSegment.text += element.value + " "
                if (currentSegment.start === 0) {
                    currentSegment.start = Math.round(element.ts)
                }
                currentSegment.end = Math.round(element.end_ts)
            }
        })
        
        if (currentSegment.text.trim()) {
            currentSegment.text = currentSegment.text.trim()
            segments.push(currentSegment)
            segmentIndex++
        }
    })
    
    return segments
}

/**
 * Poll for job completion
 */
async function startPolling(jobId) {
    console.log('🔄 [REVAI WORKER] Starting polling for job:', jobId)
    currentJobId = jobId
    pollAttempts = 0
    
    const poll = async () => {
        try {
            pollAttempts++
            
            if (pollAttempts > REVAI_CONFIG.MAX_POLL_ATTEMPTS) {
                throw new Error('Job polling timeout - transcription took too long')
            }
            
            const jobStatus = await checkJobStatus(jobId)
            console.log(' [REVAI WORKER] Job status:', jobStatus.status, `(attempt ${pollAttempts})`)
            
            // Update progress
            const progress = Math.min(0.9, pollAttempts / REVAI_CONFIG.MAX_POLL_ATTEMPTS)
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'loading',
                progress: progress,
                details: `Processing audio... (${pollAttempts}/${REVAI_CONFIG.MAX_POLL_ATTEMPTS})`
            })
            
            if (jobStatus.status === 'transcribed') {
                // Job complete, get transcript
                clearInterval(pollInterval)
                console.log('✅ [REVAI WORKER] Job completed, getting transcript...')
                const transcript = await getTranscript(jobId)
                const results = convertTranscript(transcript)
                
                self.postMessage({
                    type: MessageTypes.RESULT,
                    results: results,
                    isDone: true,
                    completedUntilTimestamp: results[results.length - 1]?.end || 0
                })
                
                self.postMessage({ type: MessageTypes.INFERENCE_DONE })
                
            } else if (jobStatus.status === 'failed') {
                clearInterval(pollInterval)
                throw new Error(`Transcription failed: ${jobStatus.failure_detail || 'Unknown error'}`)
            }
            // Continue polling for 'in_progress' status
            
        } catch (error) {
            clearInterval(pollInterval)
            console.error('❌ [REVAI WORKER] Polling error:', error)
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: error.message
            })
        }
    }
    
    pollInterval = setInterval(poll, REVAI_CONFIG.POLL_INTERVAL)
    poll() // Start immediately
}

/**
 * Main transcription function
 */
async function transcribe(audioData) {
    try {
        console.log('🎯 [REVAI WORKER] Starting transcription process...')
        
        // Convert audio data to file
        const audioFile = audioDataToFile(audioData)
        console.log('📁 [REVAI WORKER] Audio file created:', audioFile.name, audioFile.size, 'bytes')
        
        // Submit job
        self.postMessage({
            type: MessageTypes.LOADING,
            status: 'loading',
            progress: 0.1,
            details: 'Uploading audio to Rev AI...'
        })
        
        const jobId = await submitJob(audioFile)
        
        self.postMessage({
            type: MessageTypes.LOADING,
            status: 'loading',
            progress: 0.2,
            details: 'Job submitted, starting transcription...'
        })
        
        // Start polling for results
        startPolling(jobId)
        
    } catch (error) {
        console.error('❌ [REVAI WORKER] Transcription error:', error.message)
        self.postMessage({
            type: MessageTypes.LOADING,
            status: 'error',
            error: error.message
        })
    }
}

/**
 * MAIN LISTENER
 */
self.addEventListener('message', async (event) => {
    if (!event.data || typeof event.data !== 'object') return
    const { type, audio, apiKey } = event.data

    if (type === MessageTypes.INFERENCE_REQUEST) {
        // Set API key
        if (apiKey) {
            REVAI_API_KEY = apiKey
            console.log(' [REVAI WORKER] API key set:', apiKey.substring(0, 10) + '...')
        }
        
        if (!REVAI_API_KEY) {
            console.error('❌ [REVAI WORKER] No API key provided')
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: 'Rev AI API key not provided'
            })
            return
        }
        
        console.log('🎯 [REVAI WORKER] Starting transcription...')
        await transcribe(audio)
        
    } else if (type === 'CANCEL_TRANSCRIPTION') {
        if (pollInterval) {
            clearInterval(pollInterval)
            console.log('⏹️ [REVAI WORKER] Transcription cancelled')
        }
    } else if (type === 'DISPOSE') {
        if (pollInterval) {
            clearInterval(pollInterval)
        }
        console.log('🗑️ [REVAI WORKER] Worker disposed')
    }
})

// Global API key variable
let REVAI_API_KEY = null
