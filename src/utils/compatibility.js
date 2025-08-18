/**
 * Device and browser compatibility checks for audio-to-text app
 */

export class CompatibilityChecker {
    static checks = {
        audioContext: false,
        mediaRecorder: false,
        webWorkers: false,
        sharedArrayBuffer: false,
        webAssembly: false,
        webGPU: false,
        estimatedRAM: 0,
        isMobile: false,
        isIOS: false,
        browserSupport: 'unknown'
    }

    static async performChecks() {
        console.log('🔍 Performing compatibility checks...')
        
        // Basic API checks
        this.checks.audioContext = this.checkAudioContext()
        this.checks.mediaRecorder = this.checkMediaRecorder()
        this.checks.webWorkers = this.checkWebWorkers()
        this.checks.sharedArrayBuffer = this.checkSharedArrayBuffer()
        this.checks.webAssembly = this.checkWebAssembly()
        this.checks.webGPU = await this.checkWebGPU()
        
        // Device detection
        this.checks.estimatedRAM = this.estimateRAM()
        this.checks.isMobile = this.detectMobile()
        this.checks.isIOS = this.detectIOS()
        this.checks.browserSupport = this.getBrowserSupport()

        console.log('📊 Compatibility results:', this.checks)
        return this.checks
    }

    static checkAudioContext() {
        try {
            return !!(window.AudioContext || window.webkitAudioContext)
        } catch (e) {
            return false
        }
    }

    static checkMediaRecorder() {
        return !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }

    static checkWebWorkers() {
        return !!(window.Worker)
    }

    static checkSharedArrayBuffer() {
        try {
            return !!(window.SharedArrayBuffer && window.crossOriginIsolated)
        } catch (e) {
            return false
        }
    }

    static checkWebAssembly() {
        try {
            if (!window.WebAssembly) return false
            
            // Test basic WebAssembly functionality
            const wasmCode = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
            const wasmModule = new WebAssembly.Module(wasmCode)
            const wasmInstance = new WebAssembly.Instance(wasmModule)
            
            return true
        } catch (e) {
            console.warn('WebAssembly test failed:', e.message)
            return false
        }
    }

    static async checkWebGPU() {
        try {
            if (!navigator.gpu) return false
            const adapter = await navigator.gpu.requestAdapter()
            return !!adapter
        } catch (e) {
            return false
        }
    }

    static estimateRAM() {
        // Estimate device memory
        if (navigator.deviceMemory) {
            return navigator.deviceMemory * 1024 // Convert GB to MB
        }
        
        // Fallback estimation based on other factors
        const isMobile = this.detectMobile()
        const isIOS = this.detectIOS()
        
        if (isMobile) {
            return isIOS ? 3000 : 2000 // iOS typically has more RAM
        }
        
        return 4000 // Assume desktop has at least 4GB
    }

    static detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    static detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    }

    static getBrowserSupport() {
        const ua = navigator.userAgent
        
        if (ua.includes('Chrome/') && !ua.includes('Edge/')) {
            const version = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || '0')
            return version >= 88 ? 'excellent' : version >= 80 ? 'good' : 'limited'
        }
        
        if (ua.includes('Firefox/')) {
            const version = parseInt(ua.match(/Firefox\/(\d+)/)?.[1] || '0')
            return version >= 95 ? 'good' : 'limited'
        }
        
        if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
            const version = parseInt(ua.match(/Version\/(\d+)/)?.[1] || '0')
            return version >= 15 ? 'limited' : 'poor'
        }
        
        if (ua.includes('Edge/')) {
            const version = parseInt(ua.match(/Edge\/(\d+)/)?.[1] || '0')
            return version >= 88 ? 'good' : 'limited'
        }
        
        return 'unknown'
    }

    static getCompatibilityReport() {
        const issues = []
        const warnings = []
        const recommendations = []

        if (!this.checks.audioContext) {
            issues.push('AudioContext API not supported - audio processing will fail')
        }

        if (!this.checks.mediaRecorder) {
            issues.push('MediaRecorder API not supported - recording will not work')
        }

        if (!this.checks.webWorkers) {
            issues.push('Web Workers not supported - transcription will fail')
        }

        if (!this.checks.sharedArrayBuffer) {
            warnings.push('SharedArrayBuffer not available - AI models may not load properly')
            recommendations.push('Ensure your site is served with COEP and COOP headers')
        }

        if (!this.checks.webAssembly) {
            issues.push('WebAssembly not supported - AI models cannot run')
        } else if (!this.checks.sharedArrayBuffer) {
            warnings.push('WebAssembly available but SharedArrayBuffer missing - models may load slowly or fail')
        }

        if (this.checks.estimatedRAM < 2000) {
            warnings.push('Low device memory detected - transcription may be slow or fail')
            recommendations.push('Try using smaller audio files (under 2 minutes)')
        }

        if (this.checks.isIOS) {
            warnings.push('iOS detected - audio processing may have limitations')
            recommendations.push('Use Safari browser and ensure iOS 15+ for best compatibility')
        }

        if (this.checks.isMobile) {
            warnings.push('Mobile device detected - processing may be slower')
            recommendations.push('For best performance, use a desktop computer')
        }

        if (this.checks.browserSupport === 'poor' || this.checks.browserSupport === 'limited') {
            warnings.push('Browser may have limited support for modern features')
            recommendations.push('Update to the latest version of Chrome, Firefox, or Edge')
        }

        return {
            compatible: issues.length === 0,
            issues,
            warnings,
            recommendations,
            overallScore: this.calculateCompatibilityScore()
        }
    }

    static calculateCompatibilityScore() {
        let score = 0
        const maxScore = 100

        // Essential features (60 points total)
        if (this.checks.audioContext) score += 15
        if (this.checks.mediaRecorder) score += 15
        if (this.checks.webWorkers) score += 15
        if (this.checks.webAssembly) score += 15

        // Performance features (25 points total)
        if (this.checks.sharedArrayBuffer) score += 10
        if (this.checks.webGPU) score += 5
        if (this.checks.estimatedRAM >= 4000) score += 10

        // Browser quality (15 points total)
        switch (this.checks.browserSupport) {
            case 'excellent': score += 15; break
            case 'good': score += 10; break
            case 'limited': score += 5; break
            default: score += 0; break
        }

        return Math.min(score, maxScore)
    }

    static async testAudioProcessing() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            
            // Test if we can create a basic audio buffer
            const buffer = audioContext.createBuffer(1, 1024, 16000)
            const source = audioContext.createBufferSource()
            source.buffer = buffer
            source.connect(audioContext.destination)
            
            await audioContext.close()
            return true
        } catch (e) {
            console.error('Audio processing test failed:', e)
            return false
        }
    }

    static async testWorkerCreation() {
        try {
            const workerCode = `
                self.addEventListener('message', (e) => {
                    if (e.data === 'test') {
                        self.postMessage('success')
                    }
                })
            `
            const blob = new Blob([workerCode], { type: 'application/javascript' })
            const worker = new Worker(URL.createObjectURL(blob))
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    worker.terminate()
                    resolve(false)
                }, 1000)
                
                worker.onmessage = (e) => {
                    clearTimeout(timeout)
                    worker.terminate()
                    resolve(e.data === 'success')
                }
                
                worker.onerror = () => {
                    clearTimeout(timeout)
                    worker.terminate()
                    resolve(false)
                }
                
                worker.postMessage('test')
            })
        } catch (e) {
            return false
        }
    }
}

// Simplified compatibility check for quick use
export function isDeviceCompatible() {
    const hasAudio = !!(window.AudioContext || window.webkitAudioContext)
    const hasWorkers = !!window.Worker
    const hasWASM = !!window.WebAssembly
    const hasRecorder = !!(window.MediaRecorder && navigator.mediaDevices)
    
    return hasAudio && hasWorkers && hasWASM && hasRecorder
}

// Get user-friendly error messages for common issues
export function getCompatibilityError(checks) {
    if (!checks.audioContext) {
        return 'Your browser does not support audio processing. Please update your browser or try a different one.'
    }
    
    if (!checks.webAssembly) {
        return 'Your browser does not support WebAssembly, which is required for AI models. Please update your browser.'
    }
    
    if (!checks.webWorkers) {
        return 'Your browser does not support Web Workers. Please update your browser or try a different one.'
    }
    
    if (!checks.mediaRecorder) {
        return 'Your browser does not support audio recording. Recording features will not work.'
    }
    
    if (!checks.sharedArrayBuffer) {
        return 'Advanced features may not work properly. This is usually due to missing security headers on the website.'
    }
    
    return 'Unknown compatibility issue. Please try updating your browser or contact support.'
}
