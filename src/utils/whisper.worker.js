import { pipeline } from '@huggingface/transformers'
import { MessageTypes } from './presets'

class MyTranscriptionPipeline {
    static task = 'automatic-speech-recognition'
    static models = [
        'Xenova/whisper-tiny.en',   // Fast loading ~39MB - prioritize for speed
        'onnx-community/whisper-tiny.en',
        'Xenova/whisper-small.en',  // Better accuracy ~240MB - secondary option
        'onnx-community/whisper-small.en',
        'microsoft/whisper-tiny.en',
        'openai/whisper-tiny.en'
    ]
    static instance = null
    static currentModelIndex = 0
    
    // Simple unified progress tracking
    static progressTracker = {
        totalBytes: 0,
        downloadedBytes: 0,
        fileProgress: new Map(), // Track individual file progress
        reset() {
            this.totalBytes = 0
            this.downloadedBytes = 0
            this.fileProgress.clear()
        },
        updateTotal(fileName, fileSize) {
            if (!this.fileProgress.has(fileName)) {
                this.totalBytes += fileSize
                this.fileProgress.set(fileName, { total: fileSize, loaded: 0 })
            }
        },
        updateFileProgress(fileName, loaded) {
            if (this.fileProgress.has(fileName)) {
                this.fileProgress.get(fileName).loaded = loaded
            }
            // Calculate total progress across all files
            let totalLoaded = 0
            for (const fileData of this.fileProgress.values()) {
                totalLoaded += fileData.loaded
            }
            return this.totalBytes > 0 ? Math.min(100, (totalLoaded / this.totalBytes) * 100) : 0
        }
    }

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            let lastError = null
            
            // Reset progress tracker for new loading session
            this.progressTracker.reset()
            
            // Try each model in sequence until one works
            for (let i = this.currentModelIndex; i < this.models.length; i++) {
                const model = this.models[i]
                console.log(`🔄 [WORKER] Trying model ${i + 1}/${this.models.length}:`, model)
                
                try {
                    // First try to load from cache with WebGPU
                    let pipelineConfig = {
                        progress_callback,
                        dtype: 'fp32',
                        // Enhanced caching configuration
                        revision: 'main',
                        cache_dir: './models',
                        local_files_only: false,
                        // Browser caching optimizations
                        use_cache: true,
                        cache_timeout: 86400000, // 24 hours in milliseconds
                        // Performance optimizations
                        use_external_data_format: false  // Keep model data inline for better caching
                    }
                    
                    // Try WebGPU first, fallback to CPU if not available
                    try {
                        pipelineConfig.device = 'webgpu'
                        this.instance = await pipeline(this.task, model, pipelineConfig)
                    } catch (webgpuError) {
                        console.warn(`⚠️ [WORKER] WebGPU not available for ${model}, falling back to CPU:`, webgpuError.message)
                        pipelineConfig.device = 'cpu'
                        this.instance = await pipeline(this.task, model, pipelineConfig)
                    }
                    
                    console.log('✅ [WORKER] Successfully loaded model:', model)
                    this.currentModelIndex = i
                    break
                    
                } catch (error) {
                    console.warn(`⚠️ [WORKER] Model ${model} failed:`, error.message)
                    lastError = error
                    
                    // If this is a JSON parsing error (HTML received), try next model immediately
                    if (error.message.includes('Unexpected token') || error.message.includes('not valid JSON')) {
                        console.log('🔄 [WORKER] Trying next model...')
                        continue
                    }
                    
                    // For other errors, wait a bit before trying next model
                    if (i < this.models.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                    }
                }
            }
            
            // If all models failed, throw the last error
            if (this.instance === null) {
                console.error('💥 [WORKER] All models failed. Last error:', lastError)
                // Reset index for next attempt
                this.currentModelIndex = 0
                throw new Error(`Failed to load any Whisper model. Last error: ${lastError?.message || 'Unknown error'}`)
            }
        }

        return this.instance
    }
}

self.addEventListener('message', async (event) => {
    // Verify the message origin for security
    if (!event.data || typeof event.data !== 'object') {
        console.warn('⚠️ [WORKER] Invalid message received')
        return
    }
    
    const { type, audio } = event.data
    console.log('🔧 [WORKER] Received message:', type)
    
    if (type === MessageTypes.INFERENCE_REQUEST) {
        console.log('🎯 [WORKER] Starting transcription process...', {
            audioLength: audio?.length || 0,
            audioType: typeof audio
        })
        await transcribe(audio)
    }
})

async function transcribe(audio) {
    console.log('🚀 [WORKER] Transcribe function started')
    
    // Validate and normalize audio data
    console.log('🔍 [WORKER] Audio validation:', {
        length: audio.length,
        type: typeof audio,
        isArray: Array.isArray(audio),
        hasNaN: audio.some(val => isNaN(val)),
        maxValue: Math.max(...audio.slice(0, 1000)),
        minValue: Math.min(...audio.slice(0, 1000)),
        avgAmplitude: audio.slice(0, 1000).reduce((a, b) => Math.abs(a) + Math.abs(b), 0) / 1000,
        duration: `${(audio.length / 16000).toFixed(2)}s`
    })
    
    // Add minimal padding to ensure complete processing while maximizing speed
    const paddedAudio = new Float32Array(audio.length + 1600) // 0.1s padding (reduced from 0.2s)
    paddedAudio.set(audio, 800) // 0.05s offset (reduced from 0.1s)
    console.log('🔍 [WORKER] Added minimal padding for faster processing')
    
    sendLoadingMessage('loading')

    let pipeline

    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
        try {
            console.log(`📦 [WORKER] Loading model (attempt ${retryCount + 1}/${maxRetries})...`)
            pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback)
            console.log('✅ [WORKER] Model loaded, starting transcription...')
            break
        } catch (err) {
            retryCount++
            console.error(`❌ [WORKER] Model loading failed (attempt ${retryCount}/${maxRetries}):`, err.message)
            
            // Send more detailed error information to the main thread
            self.postMessage({
                type: MessageTypes.LOADING,
                status: 'error',
                error: err.message,
                attempt: retryCount,
                maxAttempts: maxRetries
            })
            
            if (retryCount >= maxRetries) {
                console.error('💥 [WORKER] All attempts failed:', err.message)
                
                self.postMessage({
                    type: MessageTypes.LOADING,
                    status: 'failed',
                    error: 'Failed to load Whisper model after multiple attempts. Please check your internet connection and try again.',
                    detailedError: err.message
                })
                return
            }
            
            // Shorter wait for JSON parsing errors (likely HTML responses)
            const isNetworkError = err.message.includes('Unexpected token') || err.message.includes('not valid JSON')
            const waitTime = isNetworkError ? 1000 : Math.pow(2, retryCount) * 1000
            
            console.log(`⏳ [WORKER] Retrying in ${waitTime}ms...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }
    }

    console.log('🎉 [WORKER] Starting transcription...')
    sendLoadingMessage('success')

    const stride_length_s = 1  // Further reduced for faster processing and better overlap
    const audioLength = Math.round(paddedAudio.length / 16000)
    console.log(`⚙️ [WORKER] Processing ${audioLength}s of padded audio...`)

    try {
        const generationTracker = new GenerationTracker(pipeline, stride_length_s)
        console.log('🔄 [WORKER] Running speech recognition...')
        
        // Detect if we're using an English-only model
        const currentModel = MyTranscriptionPipeline.models[MyTranscriptionPipeline.currentModelIndex]
        const isEnglishOnlyModel = currentModel.includes('.en')
        
        // Base configuration for all models
        const baseConfig = {
            // Core settings
            return_timestamps: true,
            
            // Sampling settings - more deterministic for structured content
            do_sample: false,
            top_k: 0,
            temperature: 0.0,
            
            // Chunk processing - optimized for faster processing and better overlap
            chunk_length_s: 30,  // Reduced for faster processing and to avoid 30s warning
            stride_length_s: stride_length_s,  // Better overlap
            
            // Enhanced for educational content
            word_timestamps: true,
            suppress_tokens: [-1],
            
            // Callbacks
            callback_function: generationTracker.callbackFunction.bind(generationTracker),
            chunk_callback: generationTracker.chunkCallback.bind(generationTracker)
        }
        
        // Add language/task only for multilingual models
        const config = isEnglishOnlyModel 
            ? baseConfig 
            : {
                ...baseConfig,
                language: 'en',
                task: 'transcribe'
            }
        
        console.log(`🎯 [WORKER] Using ${isEnglishOnlyModel ? 'English-only' : 'multilingual'} model config:`, config)
        
        // Optimized settings for educational/structured content
        const result = await pipeline(paddedAudio, config)
        
        console.log('✨ [WORKER] Recognition completed!')
        
        // If chunk callback didn't populate results, use direct pipeline result
        if (generationTracker.processed_chunks.length === 0 && result) {
            console.log('🔄 [WORKER] Processing direct result...')
            
            // Handle different possible result formats
            let chunks = []
            
            if (Array.isArray(result)) {
                chunks = result
            } else if (result.chunks && result.chunks.length > 0) {
                // Result has chunks property with content
                chunks = result.chunks
            } else if (result.text && result.text.trim()) {
                // Single result object with text content
                chunks = [result]
            } else {
                // No transcribable content found - create helpful message
                console.log('⚠️ [WORKER] No speech detected in audio')
                
                chunks = [{
                    text: 'No speech detected in audio. Please check:\n• Audio volume and quality\n• Background noise levels\n• Audio format compatibility\n• Try using a different audio file',
                    timestamp: [0, Math.round(paddedAudio.length / 16000)]
                }]
            }
            
            generationTracker.processed_chunks = chunks.map((chunk, index) => {
                return {
                    index,
                    text: chunk.text?.trim() || chunk?.trim() || '',
                    start: Math.round(chunk.timestamp?.[0] || 0),
                    end: Math.round(chunk.timestamp?.[1] || 0)
                }
            })
            
            console.log('📋 [WORKER] Processed', generationTracker.processed_chunks.length, 'text chunks')
        }
        
        generationTracker.sendFinalResult()
        console.log('🏁 [WORKER] Transcription complete!')
    } catch (err) {
        console.error('❌ [WORKER] Transcription error:', err.message)
    }
}

async function load_model_callback(data) {
    const { status } = data
    const progressTracker = MyTranscriptionPipeline.progressTracker
    
    if (status === 'initiate') {
        console.log('📦 [WORKER] Initiating download:', data.file)
        // Register file size when download initiates
        if (data.file && data.total) {
            progressTracker.updateTotal(data.file, data.total)
        }
    } else if (status === 'download') {
        console.log('📦 [WORKER] Starting download:', data.file)
    } else if (status === 'progress') {
        const { file, progress, loaded, total } = data
        
        // Detect potential HTML error pages
        const isSuspicious = progress > 10 && total < 10000
        const isLikelyHTML = total < 5000 && file?.includes('.json')
        
        // Register file size if we haven't seen it before (fallback)
        if (file && total && !progressTracker.fileProgress.has(file)) {
            progressTracker.updateTotal(file, total)
        }
        
        // Calculate unified progress across all files
        const overallProgress = progressTracker.updateFileProgress(file, loaded)
        
        // Only log important download milestones to reduce console spam
        const shouldLog = overallProgress === 0 || overallProgress >= 100 || 
                         (Math.floor(overallProgress) % 25 === 0) ||
                         isSuspicious || isLikelyHTML
        
        if (shouldLog) {
            console.log('📥 [WORKER] Model download progress:', {
                file: file.split('/').pop(), // Show just filename
                fileProgress: `${(progress * 100).toFixed(1)}%`,
                overallProgress: `${overallProgress.toFixed(1)}%`,
                loaded: `${(loaded / 1024 / 1024).toFixed(1)} MB`,
                total: `${(total / 1024 / 1024).toFixed(1)} MB`
            })
        }
        
        // Enhanced detection of HTML error pages
        if (isSuspicious || isLikelyHTML) {
            console.warn('⚠️ [WORKER] Suspicious download detected - likely receiving HTML error pages instead of model files')
            console.warn('   This usually indicates:')
            console.warn('   - Model repository not found (404)')
            console.warn('   - Network/CORS issues')
            console.warn('   - Hugging Face CDN problems')
        }
        
        // Send unified progress (0-100%)
        sendDownloadingMessage(file, overallProgress, loaded, total)
    } else if (status === 'done') {
        console.log('✅ [WORKER] Downloaded:', data.file)
        // Mark file as complete and calculate final progress
        if (data.file && progressTracker.fileProgress.has(data.file)) {
            const fileData = progressTracker.fileProgress.get(data.file)
            const overallProgress = progressTracker.updateFileProgress(data.file, fileData.total)
            sendDownloadingMessage(data.file, overallProgress, fileData.total, fileData.total)
        }
    }
}

function sendLoadingMessage(status, error = null, details = null) {
    self.postMessage({
        type: MessageTypes.LOADING,
        status,
        error,
        details
    })
}

async function sendDownloadingMessage(file, progressPercent, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress: progressPercent / 100, // Convert back to 0-1 for UI compatibility
        loaded,
        total,
        progressPercent: progressPercent // Clean 0-100% for display
    })
}

class GenerationTracker {
    constructor(pipeline, stride_length_s) {
        this.pipeline = pipeline
        this.stride_length_s = stride_length_s
        this.chunks = []
        this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions
        this.processed_chunks = []
        this.callbackFunctionCounter = 0
    }

    sendFinalResult() {
        console.log('🏁 [WORKER] Sending final result...')
        console.log('🏁 [WORKER] Processed chunks count:', this.processed_chunks.length)
        console.log('🏁 [WORKER] Processed chunks content:', this.processed_chunks)
        
        // Send final results with isDone: true
        createResultMessage(
            this.processed_chunks, true, this.getLastChunkTimestamp()
        )
        
        // Then send completion signal
        self.postMessage({ type: MessageTypes.INFERENCE_DONE })
    }

    callbackFunction(beams) {
        this.callbackFunctionCounter += 1
        if (this.callbackFunctionCounter % 10 !== 0) {
            return
        }

        const bestBeam = beams[0]
        let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true
        })

        const result = {
            text,
            start: this.getLastChunkTimestamp(),
            end: undefined
        }

        createPartialResultMessage(result)
    }

    chunkCallback(data) {
        console.log('🔄 [WORKER] chunkCallback called with data:', data)
        this.chunks.push(data)
        const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(
            this.chunks,
            {
                time_precision: this.time_precision,
                return_timestamps: true,
                force_full_sequence: false
            }
        )
        
        console.log('🔄 [WORKER] Decoded chunks:', chunks)
        console.log('🔄 [WORKER] Decoded text:', text)

        // Process new chunks and accumulate them
        const newProcessedChunks = chunks.map((chunk, index) => {
            return this.processChunk(chunk, this.processed_chunks.length + index)
        })
        
        // More conservative duplicate removal to prevent missing content
        for (const newChunk of newProcessedChunks) {
            // Only consider it a duplicate if timestamps are very close AND text is similar
            const existingIndex = this.processed_chunks.findIndex(existing => 
                Math.abs(existing.start - newChunk.start) < 0.5 && 
                Math.abs(existing.end - newChunk.end) < 0.5 &&
                existing.text.length > 0 && newChunk.text.length > 0
            )
            
            if (existingIndex >= 0) {
                // Keep the chunk with more content
                if (newChunk.text.length > this.processed_chunks[existingIndex].text.length) {
                    this.processed_chunks[existingIndex] = newChunk
                }
            } else {
                // Add new chunk if it has meaningful content
                if (newChunk.text.trim().length > 0) {
                    this.processed_chunks.push(newChunk)
                }
            }
        }
        
        // Sort chunks by start time to maintain order
        this.processed_chunks.sort((a, b) => a.start - b.start)

        console.log('🔄 [WORKER] Accumulated processed chunks:', this.processed_chunks.length, 'total chunks')
        console.log('🔄 [WORKER] Chunk timestamps:', this.processed_chunks.map(c => `${c.start}-${c.end}s`))

        createResultMessage(
            this.processed_chunks, false, this.getLastChunkTimestamp()
        )
    }

    getLastChunkTimestamp() {
        if (this.processed_chunks.length === 0) {
            return 0
        }
        // Return the end timestamp of the last chunk
        const lastChunk = this.processed_chunks[this.processed_chunks.length - 1]
        return lastChunk.end || lastChunk.start || 0
    }

    processChunk(chunk, index) {
        const { text, timestamp } = chunk
        const [start, end] = timestamp

        return {
            index,
            text: `${text.trim()}`,
            start: Math.round(start),
            end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s)
        }

    }
}

function createResultMessage(results, isDone, completedUntilTimestamp) {
    console.log('📤 [WORKER] Sending RESULT message:', {
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp,
        resultsCount: results?.length || 0
    })
    
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp
    })
}

function createPartialResultMessage(result) {
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result
    })
}
