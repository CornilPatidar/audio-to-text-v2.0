import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'
import Information from './components/Information'
import Transcribing from './components/Transcribing'
import Login from './components/Login'
import Register from './components/Register'
import { MessageTypes } from './utils/presets'


function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const [file, setFile] = useState(null)
  const [audioStream, setAudioStream] = useState(null)
  const [output, setOutput] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({
    stage: 'idle',
    message: '',
    progress: 0,
    details: ''
  })
  const [isTranscribing, setIsTranscribing] = useState(false)

  const isAudioAvailable = file || audioStream

  function handleAudioReset() {
    setFile(null)
    setAudioStream(null)
  }

  function handleCancelTranscription() {
    if (worker.current && isTranscribing) {
      console.log('⏹️ [APP] Cancelling transcription...')
      worker.current.postMessage({ type: 'CANCEL_TRANSCRIPTION' })
      setIsTranscribing(false)
      setLoading(false)
      setDownloading(false)
      setProcessingStatus({
        stage: 'cancelled',
        message: 'Transcription cancelled',
        progress: 0,
        details: 'User cancelled the process'
      })
    }
  }

  const worker = useRef(null)
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_REVAI_API_KEY || '')
  const [currentJobId, setCurrentJobId] = useState(null)

  useEffect(() => {
    // Create worker once and keep it alive
    if (!worker.current) {
      worker.current = new Worker(new URL('./utils/revai.worker', import.meta.url), {
        type: 'module'
      })
      
      console.log('🔧 [APP] Rev AI Worker created')
    }

    const onMessageReceived = async (e) => {
      // Only log important worker messages
      const shouldLogMessage = !e.data.type.includes('DOWNLOADING') || 
        (e.data.file && !e.data.file.includes('.onnx')) ||
        (e.data.progress && e.data.progress <= 1)
      
      if (shouldLogMessage) {
        const timestamp = new Date().toLocaleTimeString()
        console.log(`[${timestamp}] 📨 Worker:`, e.data.type)
      }
      
      switch (e.data.type) {
        case 'DOWNLOADING': {
          setDownloading(true)
          const fileName = e.data.file ? e.data.file.split('/').pop() : 'model file'
          const progressPercent = e.data.progress ? (e.data.progress * 100).toFixed(1) : 0
          setProcessingStatus({
            stage: 'downloading',
            message: 'Downloading AI model',
            progress: e.data.progress || 0,
            details: `${fileName} (${progressPercent}%)`
          })
          // Only log important download events to reduce console spam
          if (!e.data.file.includes('.onnx') || (e.data.progress && e.data.progress <= 1)) {
            console.log('📥 Downloading:', e.data.file, e.data.progress ? `${(e.data.progress * 100).toFixed(1)}%` : '')
          }
          break;
        }
        case 'LOADING':
          if (e.data.status === 'error' || e.data.status === 'failed') {
            setIsTranscribing(false)
            setLoading(false)
            setDownloading(false)
            setProcessingStatus({
              stage: 'error',
              message: 'Failed to load model',
              progress: 0,
              details: e.data.error || 'Please check your connection and try again'
            })
            console.error('❌ LOADING ERROR - Model failed to load:', e.data.error)
            
            // Show user-friendly error message
            const errorMessage = e.data.error || 'Failed to load the speech recognition model'
            alert(`Error loading model: ${errorMessage}\n\nThis is usually due to:\n- Network connectivity issues\n- Hugging Face CDN problems\n- Model repository access issues\n\nPlease check your internet connection and try again.`)
            
            // Reset the app state so user can try again
            setFile(null)
            setOutput(null)
          } else {
            setLoading(true)
            if (e.data.attempt) {
              setProcessingStatus({
                stage: 'loading',
                message: 'Loading AI model',
                progress: e.data.attempt / (e.data.maxAttempts || 3),
                details: `Attempt ${e.data.attempt} of ${e.data.maxAttempts || 3}`
              })
              console.log(`⚡ Loading model (${e.data.attempt}/${e.data.maxAttempts})...`)
            } else {
              setProcessingStatus({
                stage: 'loading',
                message: 'Initializing AI model',
                progress: 0.5,
                details: 'Preparing for transcription'
              })
              console.log('⚡ Loading model...')
            }
          }
          break;
        case 'RESULT': {
          setOutput(e.data.results)
          const chunkCount = e.data.results?.length || 0
          if (e.data.isDone) {
            setProcessingStatus({
              stage: 'complete',
              message: 'Transcription complete',
              progress: 1,
              details: `Generated ${chunkCount} text segments`
            })
          } else {
            setProcessingStatus({
              stage: 'transcribing',
              message: 'Processing speech',
              progress: 0.7,
              details: `Analyzing ${chunkCount} segments...`
            })
          }
          console.log(`📝 Transcription: ${e.data.results?.length || 0} chunks${e.data.isDone ? ' (complete)' : ''}`)
          break;
        }
        case 'RESULT_PARTIAL':
          setProcessingStatus({
            stage: 'transcribing',
            message: 'Generating text',
            progress: 0.8,
            details: 'Processing speech patterns...'
          })
          break;
        case 'INFERENCE_DONE':
          setIsTranscribing(false)
          setLoading(false)
          setFinished(true)
          // Store the job ID for caption requests
          if (e.data.jobId) {
            setCurrentJobId(e.data.jobId)
            console.log('📋 Job ID stored for captions:', e.data.jobId)
          }
          setProcessingStatus({
            stage: 'complete',
            message: 'Ready to view results',
            progress: 1,
            details: 'Transcription successful'
          })
          console.log('🏁 Transcription completed!')
          break;
        case 'CANCELLED':
          setIsTranscribing(false)
          setLoading(false)
          setDownloading(false)
          setProcessingStatus({
            stage: 'cancelled',
            message: 'Transcription cancelled',
            progress: 0,
            details: 'Process was cancelled by user'
          })
          console.log('⏹️ Transcription cancelled!')
          break;
        default:
          console.log('❓ Unknown message type:', e.data.type, e.data)
          break;
      }
    }

    worker.current.addEventListener('message', onMessageReceived)

    // Cleanup on component unmount only
    return () => {
      if (worker.current) {
        worker.current.removeEventListener('message', onMessageReceived)
        console.log('🔧 [APP] Worker event listener removed')
        
        // Only dispose worker when app is unmounting
        worker.current.postMessage({ type: 'DISPOSE' })
        worker.current.terminate()
        worker.current = null
        console.log('🗑️ [APP] Worker disposed and terminated')
      }
    }
  }, []) // Empty dependency array - only run once

  async function readAudioFrom(file) {
    const sampling_rate = 16000
    const audioCTX = new AudioContext({ sampleRate: sampling_rate })
    const response = await file.arrayBuffer()
    const decoded = await audioCTX.decodeAudioData(response)
    const audio = decoded.getChannelData(0)
    return audio
  }

  async function handleFormSubmission(transcriptionData = {}) {
    console.log('🎤 Starting transcription...')
    
    if (!file && !audioStream) { 
      return 
    }

    // Prevent concurrent transcriptions
    if (isTranscribing) {
      console.warn('⚠️ [APP] Transcription already in progress')
      return
    }

    console.log('📁 Processing:', file?.name || 'audio stream')
    
    // Log advanced options
    if (transcriptionData.customVocabulary && transcriptionData.customVocabulary.length > 0) {
      console.log('📝 Custom vocabulary:', transcriptionData.customVocabulary)
    }
    if (transcriptionData.rush) {
      console.log('⚡ Rush processing enabled (+$1.25/minute)')
    }
    if (transcriptionData.verbatim) {
      console.log('📝 Verbatim transcription enabled (+$0.50/minute)')
    }
    if (transcriptionData.humanTranscription) {
      console.log('👤 Human transcription enabled ($1.99/minute)')
    }
    console.log('🤖 Model:', transcriptionData.model || 'reverb')

    try {
      setIsTranscribing(true)
      setProcessingStatus({
        stage: 'preparing',
        message: 'Preparing audio',
        progress: 0.1,
        details: 'Converting audio format...'
      })
      
      console.log('🔄 Converting audio...')
      let audio = await readAudioFrom(file ? file : audioStream)
      console.log(`✅ Audio ready: ${Math.round(audio.length / 16000)}s`)

      setProcessingStatus({
        stage: 'starting',
        message: 'Starting transcription',
        progress: 0.2,
        details: 'Connecting to AI model...'
      })

      const model_name = `openai/whisper-tiny.en`
      console.log('📤 Sending to worker...')

      worker.current.postMessage({
        type: MessageTypes.INFERENCE_REQUEST,
        audio,
        apiKey,
        customVocabulary: transcriptionData.customVocabulary || [],
        rush: transcriptionData.rush || false,
        verbatim: transcriptionData.verbatim || false,
        humanTranscription: transcriptionData.humanTranscription || false,
        model: transcriptionData.model || 'reverb'
      })
      
      console.log('✅ Processing started...')
    } catch (error) {
      console.error('❌ Error during audio processing:', error)
      setIsTranscribing(false)
      setProcessingStatus({
        stage: 'error',
        message: 'Audio processing failed',
        progress: 0,
        details: error.message || 'Please try a different audio file'
      })
    }
  }

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner animate-spin text-4xl text-red-400 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>
      <section className='min-h-screen flex flex-col'>
        <Header />
        {output ? (
          <Information 
            output={output} 
            finished={finished}
            jobId={currentJobId}
            worker={worker.current}
            apiKey={apiKey}
          />
        ) : loading ? (
          <Transcribing 
            downloading={downloading} 
            processingStatus={processingStatus} 
            onCancel={isTranscribing ? handleCancelTranscription : null}
          />
        ) : isAudioAvailable ? (
          <FileDisplay 
            handleFormSubmission={handleFormSubmission} 
            handleAudioReset={handleAudioReset} 
            file={file} 
            audioStream={audioStream}
            isTranscribing={isTranscribing}
          />
        ) : (
          <HomePage setFile={setFile} setAudioStream={setAudioStream} />
        )}
      </section>
      <footer></footer>
    </div>
  )
}

function MainApp() {
  const { user, loading: authLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner animate-spin text-4xl text-red-400 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppContent />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
