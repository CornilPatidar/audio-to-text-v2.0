import React, { useState, useEffect, useRef } from 'react'

export default function HomePage(props) {
    const { setAudioStream, setFile } = props

    const [recordingStatus, setRecordingStatus] = useState('inactive')
    const [duration, setDuration] = useState(0)

    const mediaRecorder = useRef(null)

    async function startRecording() {
        let tempStream
        console.log('Start recording')

        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                },
                video: false
            })
            tempStream = streamData
        } catch (err) {
            console.error('Microphone access error:', err.message)
            
            let errorMessage = 'Unable to access microphone. '
            if (err.name === 'NotAllowedError') {
                errorMessage += 'Please allow microphone access and try again.'
            } else if (err.name === 'NotFoundError') {
                errorMessage += 'No microphone found. Please check your audio devices.'
            } else {
                errorMessage += 'Please check your microphone permissions and try again.'
            }
            
            alert(errorMessage)
            return
        }
        
        setRecordingStatus('recording')

        // Try different mime types for better compatibility
        let options = { mimeType: 'audio/webm' }
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' }
            } else if (MediaRecorder.isTypeSupported('audio/wav')) {
                options = { mimeType: 'audio/wav' }
            } else {
                options = {} // Use default
            }
        }

        //create new Media recorder instance
        const media = new MediaRecorder(tempStream, options)
        mediaRecorder.current = media

        // Store audio chunks in ref to avoid state closure issues
        const chunks = []
        
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return }
            if (event.data.size === 0) { return }
            console.log('Audio chunk received:', event.data.size, 'bytes')
            chunks.push(event.data)
        }

        mediaRecorder.current.onstop = () => {
            console.log('Recording stopped, creating blob with', chunks.length, 'chunks')
            const audioBlob = new Blob(chunks, { type: options.mimeType || 'audio/webm' })
            console.log('Audio blob created:', audioBlob.size, 'bytes')
            setAudioStream(audioBlob)
            setDuration(0)
            
            // Stop all tracks to release microphone
            tempStream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.current.start(100) // Collect data every 100ms
    }

    async function stopRecording() {
        setRecordingStatus('inactive')
        console.log('Stop recording')

        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop()
        }
    }

    useEffect(() => {
        if (recordingStatus === 'inactive') { return }

        const interval = setInterval(() => {
            setDuration(curr => curr + 1)
        }, 1000)

        return () => clearInterval(interval)
    })


    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4  justify-center pb-20'>
            <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>Audio<span className='text-red-400 bold'>Textly</span></h1>
            <h3 className='font-medium md:text-lg'>Record or Upload <span className='text-red-400'>&rarr;</span> Transcribe</h3>
            <button onClick={recordingStatus === 'recording' ? stopRecording : startRecording} className='flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                <p className='text-red-400'>{recordingStatus === 'inactive' ? 'Record' : `Stop recording`}</p>
                <div className='flex items-center gap-2'>
                    {duration !== 0 && (
                        <p className='text-sm'>{duration}s</p>
                    )} 
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === 'recording' ? ' text-rose-300 animate-pulse' : "")}></i>
                </div>
            </button>
            {recordingStatus === 'recording' && (
                <p className='text-sm text-red-500 animate-pulse'>🔴 Recording... Speak clearly into your microphone</p>
            )}
            <p className='text-base'>Or <label className='text-red-400 cursor-pointer hover:text-red-600 duration-200'>Upload <input onChange={(e) => {
                const tempFile = e.target.files[0]
                setFile(tempFile)
            }} className='hidden' type='file' accept='.mp3,.mp4' /></label> a mp3/mp4 file</p>
            
        </main>
    )
}