import { MessageTypes } from './presets'

// RevAI API Configuration
const isDevelopment = import.meta.env.DEV
const CORS_PROXY = 'https://corsproxy.io/?'

const REVAI_CONFIG = {
    BASE_URL: isDevelopment ? '/api/revai' : `${CORS_PROXY}https://api.rev.ai/speechtotext/v1`,
    POLL_INTERVAL: 2000, // 2 seconds
    MAX_POLL_ATTEMPTS: 150, // 5 minutes max
    SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'webm']
}

// State management for tracking transcription progress
let currentJobId = null
let pollInterval = null
let pollAttempts = 0
let startTime = null
let audioDuration = 0

/**
 * Get progress status message
 */
function getProgressStatus() {
    if (!startTime) return { message: 'Processing audio...', progress: 0.2 }
    
    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000)
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
    const estimatedTotalSeconds = audioDuration * 2.5
    const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds)
    
    let message = 'Processing audio...'
    if (elapsedMinutes > 0) {
        message += ` (${elapsedMinutes} minute${elapsedMinutes > 1 ? 's' : ''} elapsed)`
    }
    
    if (remainingSeconds > 60) {
        const remainingMinutes = Math.ceil(remainingSeconds / 60)
        message += ` - Estimated ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} remaining`
    } else if (remainingSeconds > 0) {
        message += ` - Estimated ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} remaining`
    }
    
    // Simple progress calculation
    const progress = Math.min(0.9, 0.2 + (elapsedSeconds / estimatedTotalSeconds) * 0.7)
    return { message, progress: Math.max(0.2, progress) }
}

/**
 * Convert audio data to WAV file format for upload
 */
function audioDataToFile(audioData, fileName = 'audio.wav') {
    const sampleRate = 16000
    const numChannels = 1
    const bitsPerSample = 16
    
    const buffer = new ArrayBuffer(44 + audioData.length * 2)
    const view = new DataView(buffer)
    
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }
    
    // Write WAV file header
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + audioData.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true)
    view.setUint16(32, numChannels * bitsPerSample / 8, true)
    view.setUint16(34, bitsPerSample, true)
    writeString(36, 'data')
    view.setUint32(40, audioData.length * 2, true)
    
    // Write audio data samples
    let offset = 44
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
    }
    
    return new File([buffer], fileName, { type: 'audio/wav' })
}

/**
 * Submit audio file to RevAI for transcription
 */
async function submitJob(audioFile, options = {}) {
    const { customVocabulary = [], rush = false, verbatim = false, humanTranscription = false, model = 'reverb' } = options
    
    const formData = new FormData()
    formData.append('media', audioFile)
    formData.append('metadata', 'Audio transcription from web app')
    
    if (customVocabulary.length > 0) {
        const customVocabulariesArray = customVocabulary.map(phrase => ({
            phrase: phrase.trim()
        }));
        formData.append('custom_vocabularies', JSON.stringify(customVocabulariesArray))
    }
    
    if (rush) {
        formData.append('rush', 'true')
    }
    if (verbatim) {
        formData.append('verbatim', 'true')
    }
    
    if (humanTranscription) {
        formData.append('transcriber', 'human')
    } else if (model === 'reverb_turbo') {
        formData.append('transcriber', 'low_cost')
    } else {
        formData.append('transcriber', 'machine')
    }
    
    try {
        const headers = {
            'Authorization': `Bearer ${REVAI_API_KEY}`
        }
        
        const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs`, {
            method: 'POST',
            headers: headers,
            body: formData
        })
        
        if (!response.ok) {
            let errorMessage = 'Failed to submit audio for transcription'
            if (response.status === 401) {
                errorMessage = 'Invalid API key'
            } else if (response.status === 413) {
                errorMessage = 'Audio file is too large'
            } else if (response.status === 429) {
                errorMessage = 'Too many requests, please try again later'
            }
            throw new Error(errorMessage)
        }
        
        const job = await response.json()
        return job.id
        
    } catch (error) {
        throw error
    }
}

/**
 * Check the status of a RevAI transcription job
 */
async function checkJobStatus(jobId) {
    const headers = {
        'Authorization': `Bearer ${REVAI_API_KEY}`
    }
    
    const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs/${jobId}`, {
        headers: headers
    })
    
    if (!response.ok) {
        let errorMessage = 'Failed to check transcription status'
        if (response.status === 401) {
            errorMessage = 'Invalid API key'
        } else if (response.status === 404) {
            errorMessage = 'Transcription job not found'
        }
        throw new Error(errorMessage)
    }
    
    return await response.json()
}

/**
 * Retrieve the completed transcript from RevAI
 */
async function getTranscript(jobId) {
    const headers = {
        'Authorization': `Bearer ${REVAI_API_KEY}`,
        'Accept': 'application/vnd.rev.transcript.v1.0+json'
    }
    
    const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs/${jobId}/transcript`, {
        headers: headers
    })
    
    if (!response.ok) {
        let errorMessage = 'Failed to get transcription results'
        if (response.status === 401) {
            errorMessage = 'Invalid API key'
        } else if (response.status === 404) {
            errorMessage = 'Transcription not found'
        } else if (response.status === 409) {
            errorMessage = 'Transcription is still processing'
        }
        throw new Error(errorMessage)
    }
    
    return await response.json()
}

/**
 * Retrieve captions from RevAI in SRT or VTT format
 */
async function getCaptions(jobId, format = 'srt') {
    const headers = {
        'Authorization': `Bearer ${REVAI_API_KEY}`,
        'Accept': format === 'vtt' ? 'text/vtt' : 'application/x-subrip'
    }
    
    const response = await fetch(`${REVAI_CONFIG.BASE_URL}/jobs/${jobId}/captions`, {
        headers: headers
    })
    
    if (!response.ok) {
        let errorMessage = 'Failed to get captions'
        if (response.status === 401) {
            errorMessage = 'Invalid API key'
        } else if (response.status === 404) {
            errorMessage = 'Job not found'
        } else if (response.status === 409) {
            errorMessage = 'Job is still processing'
        }
        throw new Error(errorMessage)
    }
    
    return await response.text()
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
 * Start polling for job completion
 */
async function startPolling(jobId) {
    currentJobId = jobId
    pollAttempts = 0
    startTime = Date.now()
    
    const poll = async () => {
        try {
            pollAttempts++
            
            if (pollAttempts > REVAI_CONFIG.MAX_POLL_ATTEMPTS) {
                throw new Error('Transcription took too long')
            }
            
            const jobStatus = await checkJobStatus(jobId)
            const { message, progress } = getProgressStatus()
            
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'loading',
                progress: progress,
                details: message
            })
            
            if (jobStatus.status === 'transcribed') {
                clearInterval(pollInterval)
                
                self.postMessage({
                    type: MessageTypes.LOADING,
                    status: 'loading',
                    progress: 0.95,
                    details: 'Retrieving transcript...'
                })
                
                const transcript = await getTranscript(jobId)
                const results = convertTranscript(transcript)
                
                self.postMessage({
                    type: MessageTypes.RESULT,
                    results: results,
                    isDone: true,
                    completedUntilTimestamp: results[results.length - 1]?.end || 0,
                    jobId: jobId
                })
                
                self.postMessage({ 
                    type: MessageTypes.INFERENCE_DONE,
                    jobId: jobId
                })
                
            } else if (jobStatus.status === 'failed') {
                clearInterval(pollInterval)
                throw new Error(`Transcription failed: ${jobStatus.failure_detail || 'Unknown error'}`)
            }
            
        } catch (error) {
            clearInterval(pollInterval)
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: error.message
            })
        }
    }
    
    pollInterval = setInterval(poll, REVAI_CONFIG.POLL_INTERVAL)
    poll()
}

/**
 * Main transcription function
 */
async function transcribe(audioData, options = {}) {
    const { customVocabulary = [], rush = false, verbatim = false, humanTranscription = false, model = 'reverb' } = options
    
    try {
        audioDuration = Math.round(audioData.length / 16000)
        const audioFile = audioDataToFile(audioData)
        
        self.postMessage({
            type: MessageTypes.LOADING,
            status: 'loading',
            progress: 0.1,
            details: 'Uploading audio...'
        })
        
        const jobId = await submitJob(audioFile, { customVocabulary, rush, verbatim, humanTranscription, model })
        
        const processingTime = humanTranscription ? '12-24 hours' : `${Math.ceil(audioDuration * 2.5 / 60)} minutes`
        self.postMessage({
            type: MessageTypes.LOADING,
            status: 'loading',
            progress: 0.2,
            details: `Job submitted. Estimated time: ${processingTime}`
        })
        
        startPolling(jobId)
        
    } catch (error) {
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
    const { type, audio, apiKey, customVocabulary, rush, verbatim, humanTranscription, model, jobId, captionFormat } = event.data

    if (type === MessageTypes.INFERENCE_REQUEST) {
        if (apiKey) {
            REVAI_API_KEY = apiKey
        }
        
        if (!REVAI_API_KEY) {
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: 'API key not provided'
            })
            return
        }
        
        await transcribe(audio, { 
            customVocabulary: customVocabulary || [], 
            rush: rush || false, 
            verbatim: verbatim || false, 
            humanTranscription: humanTranscription || false, 
            model: model || 'reverb' 
        })
        
    } else if (type === MessageTypes.CAPTIONS_REQUEST) {
        if (!REVAI_API_KEY) {
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: 'API key not provided'
            })
            return
        }
        
        if (!jobId) {
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: 'Job ID not provided'
            })
            return
        }
        
        try {
            const captions = await getCaptions(jobId, captionFormat || 'srt')
            
            self.postMessage({
                type: MessageTypes.CAPTIONS_RESULT,
                captions: captions,
                format: captionFormat || 'srt',
                jobId: jobId
            })
            
        } catch (error) {
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: error.message
            })
        }
        
    } else if (type === 'CANCEL_TRANSCRIPTION') {
        if (pollInterval) {
            clearInterval(pollInterval)
        }
    } else if (type === 'DISPOSE') {
        if (pollInterval) {
            clearInterval(pollInterval)
        }
    }
})

// Global API key variable
let REVAI_API_KEY = null
