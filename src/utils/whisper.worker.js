import { pipeline } from '@huggingface/transformers'
import { MessageTypes } from './presets'

// Performance constants
const PERFORMANCE_CONFIG = {
    MODEL_LOAD_TIMEOUT: 30000,
    TRANSCRIPTION_TIMEOUT: 120000,
    MAX_AUDIO_DURATION: 600, // 10 minutes
    RMS_SPEECH_THRESHOLD: 0.005,
    CHUNK_SIZE: 30,
    STRIDE_SIZE: 5,
    MAX_RETRIES: 2
}

// Memory management
let audioProcessingActive = false
let currentTranscriptionController = null

/**
 * Ensure audio is Float32Array @ 16kHz mono
 * Main thread already resamples to 16kHz using AudioContext
 */
function ensure16kMonoFloat32(audioData) {
    validateAudioInput(audioData)
    // Audio from main thread is already resampled to 16kHz
    return audioData
}

class MyTranscriptionPipeline {
    static task = 'automatic-speech-recognition'
    static models = [
        'Xenova/whisper-tiny.en',
        'onnx-community/whisper-tiny.en',
        'Xenova/whisper-small.en',
        'onnx-community/whisper-small.en',
        'microsoft/whisper-tiny.en',
        'openai/whisper-tiny.en'
    ]
    static instance = null
    static currentModelIndex = 0

    static progressTracker = {
        totalBytes: 0,
        downloadedBytes: 0,
        fileProgress: new Map(),
        reset() {
            this.totalBytes = 0
            this.downloadedBytes = 0
            this.fileProgress.clear()
            // Force garbage collection hint
            if (global.gc) global.gc()
        },
        updateTotal(fileName, fileSize) {
            if (!this.fileProgress.has(fileName)) {
                this.totalBytes += fileSize
                this.fileProgress.set(fileName, { total: fileSize, loaded: 0 })
            }
        },
        updateFileProgress(fileName, loaded) {
            const fileData = this.fileProgress.get(fileName)
            if (fileData) {
                fileData.loaded = loaded
            }
            let totalLoaded = 0
            for (const data of this.fileProgress.values()) {
                totalLoaded += data.loaded
            }
            return this.totalBytes > 0 ? Math.min(100, (totalLoaded / this.totalBytes) * 100) : 0
        }
    }

    static dispose() {
        if (this.instance) {
            try {
                if (typeof this.instance.dispose === 'function') {
                    this.instance.dispose()
                }
            } catch (e) {
                console.warn('⚠️ [WORKER] Error disposing model:', e.message)
            }
            this.instance = null
        }
        this.progressTracker.reset()
        this.currentModelIndex = 0
    }

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            let lastError = null
            this.progressTracker.reset()

            for (let i = this.currentModelIndex; i < this.models.length; i++) {
                const model = this.models[i]
                console.log(`🔄 [WORKER] Trying model ${i + 1}/${this.models.length}:`, model)

                try {
                    let pipelineConfig = {
                        progress_callback,
                        dtype: 'fp32',
                        revision: 'main',
                        cache_dir: './models',
                        local_files_only: false,
                        use_cache: true,
                        cache_timeout: 86400000,
                        use_external_data_format: false
                    }

                    try {
                        pipelineConfig.device = 'webgpu'
                        this.instance = await safePipelineLoad(this.task, model, pipelineConfig)
                    } catch (webgpuError) {
                        console.warn(`⚠️ [WORKER] WebGPU not available, fallback to CPU`, webgpuError.message)
                        pipelineConfig.device = 'cpu'
                        this.instance = await safePipelineLoad(this.task, model, pipelineConfig)
                    }

                    console.log('✅ [WORKER] Successfully loaded model:', model)
                    this.currentModelIndex = i
                    break
                } catch (error) {
                    console.warn(`⚠️ [WORKER] Model ${model} failed:`, error.message)
                    lastError = error
                }
            }

            if (this.instance === null) {
                throw new Error(`Failed to load any Whisper model. Last error: ${lastError?.message || 'Unknown error'}`)
            }
        }
        return this.instance
    }
}

async function safePipelineLoad(task, model, config, timeout = PERFORMANCE_CONFIG.MODEL_LOAD_TIMEOUT) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
        controller.abort()
    }, timeout)
    
    try {
        const result = await Promise.race([
            pipeline(task, model, { ...config, signal: controller.signal }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`⏳ Model load timeout after ${timeout/1000}s`)), timeout)
            )
        ])
        clearTimeout(timeoutId)
        return result
    } catch (error) {
        clearTimeout(timeoutId)
        controller.abort()
        throw error
    }
}

/**
 * Check if device has sufficient capabilities for transcription
 */
function checkDeviceCapabilities() {
    const issues = []
    
    // Check for WebAssembly support
    if (typeof WebAssembly === 'undefined') {
        issues.push('WebAssembly not supported')
    }
    
    // Check for SharedArrayBuffer (indicates proper security headers)
    if (typeof SharedArrayBuffer === 'undefined') {
        issues.push('SharedArrayBuffer not available - missing security headers')
    }
    
    // Estimate available memory
    const memoryEstimate = navigator.deviceMemory ? navigator.deviceMemory * 1024 : 2048
    if (memoryEstimate < 1500) {
        issues.push('Low device memory detected')
    }
    
    return {
        compatible: issues.length === 0,
        issues,
        memoryEstimate
    }
}

/**
 * MAIN LISTENER
 */
self.addEventListener('message', async (event) => {
    if (!event.data || typeof event.data !== 'object') return
    const { type, audio } = event.data

    if (type === MessageTypes.INFERENCE_REQUEST) {
        // Check device capabilities before processing
        const capabilities = checkDeviceCapabilities()
        if (!capabilities.compatible) {
            console.error('❌ [WORKER] Device not compatible:', capabilities.issues)
            sendLoadingMessage('failed', `Device not compatible: ${capabilities.issues.join(', ')}`)
            return
        }
        // Prevent concurrent transcriptions
        if (audioProcessingActive) {
            console.warn('⚠️ [WORKER] Transcription already in progress, ignoring request')
            return
        }
        
        console.log('🎯 [WORKER] Starting transcription...')
        audioProcessingActive = true
        
        try {
            await transcribe(audio)
        } finally {
            audioProcessingActive = false
            currentTranscriptionController = null
        }
    } else if (type === 'CANCEL_TRANSCRIPTION') {
        if (currentTranscriptionController) {
            currentTranscriptionController.abort()
            console.log('⏹️ [WORKER] Transcription cancelled')
        }
    } else if (type === 'DISPOSE') {
        MyTranscriptionPipeline.dispose()
        console.log('🗑️ [WORKER] Worker disposed')
    }
})

function calculateRMS(float32Audio) {
    let sum = 0
    const length = float32Audio.length
    for (let i = 0; i < length; i++) {
        sum += float32Audio[i] * float32Audio[i]
    }
    return Math.sqrt(sum / length)
}

function hasSpeech(float32Audio, rms = null) {
    const actualRMS = rms ?? calculateRMS(float32Audio)
    return actualRMS > PERFORMANCE_CONFIG.RMS_SPEECH_THRESHOLD
}

function validateAudioInput(audioData) {
    if (!(audioData instanceof Float32Array)) {
        throw new Error("Expected Float32Array audio input")
    }
    
    const duration = audioData.length / 16000
    if (duration > PERFORMANCE_CONFIG.MAX_AUDIO_DURATION) {
        throw new Error(`Audio too long: ${duration.toFixed(1)}s (max: ${PERFORMANCE_CONFIG.MAX_AUDIO_DURATION}s)`)
    }
    
    if (duration < 0.1) {
        throw new Error("Audio too short (minimum 0.1 seconds)")
    }
    
    return duration
}

/**
 * Transcription core
 */
async function transcribe(audioData) {
    let float32Audio = null
    
    try {
        // Input validation and preprocessing
        float32Audio = ensure16kMonoFloat32(audioData)
        const duration = validateAudioInput(float32Audio)
        const rms = calculateRMS(float32Audio)
        
        console.log('🔍 [WORKER] Audio stats:', {
            length: float32Audio.length,
            durationSec: duration.toFixed(2),
            rms: rms.toFixed(6)
        })

        // Early speech detection
        if (!hasSpeech(float32Audio, rms)) {
            const noSpeechResult = [{
                index: 0,
                text: "⚠️ No clear speech detected. Please check volume/noise.",
                start: 0,
                end: Math.round(duration)
            }]
            createResultMessage(noSpeechResult, true, Math.round(duration))
            self.postMessage({ type: MessageTypes.INFERENCE_DONE })
            return
        }

        sendLoadingMessage('loading')

        // Create cancellation controller
        currentTranscriptionController = new AbortController()
        
        const model = await MyTranscriptionPipeline.getInstance(load_model_callback)

        const config = {
            return_timestamps: true,
            do_sample: false,
            temperature: 0,
            suppress_tokens: [-1],
            condition_on_previous_text: false,
            initial_prompt: "This is a dictation. Only transcribe exactly what is spoken in the audio.",
            word_timestamps: true,
            chunk_length_s: PERFORMANCE_CONFIG.CHUNK_SIZE,
            stride_length_s: PERFORMANCE_CONFIG.STRIDE_SIZE,
            signal: currentTranscriptionController.signal
        }

        console.log('⚙️ [WORKER] Running Whisper...')
        
        // Add timeout for transcription
        const transcriptionPromise = model(float32Audio, config)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transcription timeout')), PERFORMANCE_CONFIG.TRANSCRIPTION_TIMEOUT)
        )
        
        const result = await Promise.race([transcriptionPromise, timeoutPromise])
        console.log('✨ [WORKER] Result received')

        // Process results efficiently
        const finalResult = processTranscriptionResult(result, duration)
        
        console.log(`📝 [WORKER] Final result: ${finalResult.length} segments`)
        createResultMessage(finalResult, true, finalResult[finalResult.length - 1]?.end || Math.round(duration))
        self.postMessage({ type: MessageTypes.INFERENCE_DONE })
        
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('⏹️ [WORKER] Transcription cancelled')
            sendLoadingMessage('cancelled', 'Transcription was cancelled')
        } else {
            console.error("❌ [WORKER] Transcription error:", err.message)
            sendLoadingMessage('failed', err.message)
        }
    } finally {
        // Clean up memory
        if (float32Audio) {
            float32Audio = null
        }
        currentTranscriptionController = null
        
        // Suggest garbage collection
        if (global.gc) global.gc()
    }
}

function processTranscriptionResult(result, duration) {
    if (!result) {
        return [{
            index: 0,
            text: "⚠️ Transcription failed. Please try again.",
            start: 0,
            end: Math.round(duration)
        }]
    }

    // Handle chunked results (longer audio)
    if (result.chunks && Array.isArray(result.chunks) && result.chunks.length > 0) {
        return result.chunks
            .map((chunk, index) => {
                let chunkText = ""
                let startTime = 0
                let endTime = 0
                
                if (typeof chunk === 'string') {
                    chunkText = chunk.trim()
                } else if (chunk && typeof chunk === 'object') {
                    chunkText = (chunk.text || chunk.transcript || chunk.content || "").toString().trim()
                    startTime = Math.round(chunk.timestamp?.[0] || chunk.start || 0)
                    endTime = Math.round(chunk.timestamp?.[1] || chunk.end || 0)
                }
                
                return {
                    index,
                    text: chunkText,
                    start: startTime,
                    end: endTime
                }
            })
            .filter(chunk => chunk.text.length > 0)
    }
    
    // Handle single text result (shorter audio)
    if (result.text?.trim()) {
        return [{
            index: 0,
            text: result.text.trim(),
            start: 0,
            end: Math.round(duration)
        }]
    }

    // No valid result
    return [{
        index: 0,
        text: "⚠️ No transcription generated. Please try again.",
        start: 0,
        end: Math.round(duration)
    }]
}

/**
 * Progress and messaging
 */
async function load_model_callback(data) {
    const { status } = data
    const progressTracker = MyTranscriptionPipeline.progressTracker

    if (status === 'progress') {
        const { file, loaded, total } = data
        if (file && total && !progressTracker.fileProgress.has(file)) {
            progressTracker.updateTotal(file, total)
        }
        const overallProgress = progressTracker.updateFileProgress(file, loaded)
        sendDownloadingMessage(file, overallProgress, loaded, total)
    }
}

function sendLoadingMessage(status, error = null) {
    self.postMessage({ type: MessageTypes.LOADING, status, error })
}

async function sendDownloadingMessage(file, progressPercent, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress: progressPercent / 100,
        loaded,
        total,
        progressPercent
    })
}

function createResultMessage(results, isDone, completedUntilTimestamp) {
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp
    })
}
