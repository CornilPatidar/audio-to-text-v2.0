// Import React hooks for state management, effects, and refs
import React, { useState, useEffect, useRef } from 'react'

/**
 * HomePage Component - Main landing page with audio recording and file upload
 * 
 * This component provides the primary interface for users to either:
 * 1. Record audio directly using their device's microphone
 * 2. Upload an existing audio file (mp3/mp4)
 * 
 * It handles microphone permissions, recording state, and passes the audio
 * data back to the parent component for transcription processing.
 */
export default function HomePage(props) {
    // Destructure callback functions passed from parent component
    const { 
        setAudioStream,  // Function to pass recorded audio blob to parent
        setFile          // Function to pass uploaded file to parent
    } = props

    // State for tracking the current recording status
    const [recordingStatus, setRecordingStatus] = useState('inactive') // 'inactive' or 'recording'
    
    // State for storing audio data chunks during recording
    const [audioChunks, setAudioChunks] = useState([])
    
    // State for tracking recording duration in seconds
    const [duration, setDuration] = useState(0)

    // Ref to store MediaRecorder instance for audio recording
    const mediaRecorder = useRef(null)

    // Audio format for recording - WebM is widely supported for web audio
    const mimeType = 'audio/webm'

    /**
     * Initiates audio recording using the device's microphone
     * 
     * This function:
     * 1. Requests microphone permissions from the user
     * 2. Creates a MediaRecorder instance to capture audio
     * 3. Sets up event handlers to collect audio data chunks
     * 4. Updates the recording status to reflect active recording
     */
    async function startRecording() {
        let tempStream
        console.log('Start recording')

        try {
            // Request access to user's microphone
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,  // Enable audio capture
                video: false  // Disable video capture
            })
            tempStream = streamData
        } catch (err) {
            // Handle permission denied or device access errors
            console.log(err.message)
            return
        }
        
        // Update UI state to show recording is active
        setRecordingStatus('recording')

        // Create new MediaRecorder instance with the audio stream
        const media = new MediaRecorder(tempStream, { type: mimeType })
        mediaRecorder.current = media

        // Start the recording process
        mediaRecorder.current.start()
        let localAudioChunks = []
        
        // Set up event handler to collect audio data as it's recorded
        mediaRecorder.current.ondataavailable = (event) => {
            // Skip if no data or empty data
            if (typeof event.data === 'undefined') { return }
            if (event.data.size === 0) { return }
            // Collect audio chunks for later processing
            localAudioChunks.push(event.data)
        }
        setAudioChunks(localAudioChunks)
    }

    /**
     * Stops the current audio recording and processes the recorded data
     * 
     * This function:
     * 1. Stops the MediaRecorder instance
     * 2. Combines all audio chunks into a single Blob
     * 3. Passes the audio blob to the parent component
     * 4. Resets the recording state for the next session
     */
    async function stopRecording() {
        // Update UI state to show recording has stopped
        setRecordingStatus('inactive')
        console.log('Stop recording')

        // Stop the MediaRecorder
        mediaRecorder.current.stop()
        
        // Handle the stop event - process all recorded audio chunks
        mediaRecorder.current.onstop = () => {
            // Combine all audio chunks into a single Blob object
            const audioBlob = new Blob(audioChunks, { type: mimeType })
            
            // Send the audio blob to the parent component for further processing
            setAudioStream(audioBlob)
            
            // Reset state for next recording session
            setAudioChunks([])
            setDuration(0)
        }
    }

    /**
     * Effect hook to manage the recording duration timer
     * 
     * When recording is active, this creates an interval that increments
     * the duration counter every second. The interval is cleaned up when
     * recording stops or component unmounts.
     */
    useEffect(() => {
        // Only run timer when actively recording
        if (recordingStatus === 'inactive') { return }

        // Create interval to increment duration every second
        const interval = setInterval(() => {
            setDuration(curr => curr + 1)
        }, 1000)

        // Cleanup function to clear interval when effect re-runs or component unmounts
        return () => clearInterval(interval)
    })

    // Render the main homepage interface
    return (
        // Main container with centered, responsive layout
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4  justify-center pb-20'>
            {/* Application title with brand styling */}
            <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>Audio<span className='text-blue-400 bold'>Bridge</span></h1>
            
            {/* Subtitle describing the app's workflow */}
            <h3 className='font-medium md:text-lg'>Record <span className='text-blue-400'>&rarr;</span> Transcribe <span className='text-blue-400'>&rarr;</span> Translate</h3>
            
            {/* Main recording button - toggles between start/stop recording */}
            <button 
                onClick={recordingStatus === 'recording' ? stopRecording : startRecording} 
                className='flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'
            >
                {/* Button text changes based on recording status */}
                <p className='text-blue-400'>{recordingStatus === 'inactive' ? 'Record' : `Stop recording`}</p>
                
                {/* Right side of button: duration counter and microphone icon */}
                <div className='flex items-center gap-2'>
                    {/* Show duration counter only when recording has started */}
                    {duration !== 0 && (
                        <p className='text-sm'>{duration}s</p>
                    )} 
                    {/* Microphone icon - changes color when recording */}
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === 'recording' ? ' text-rose-300' : "")}></i>
                </div>
            </button>
            
            {/* Alternative file upload option */}
            <p className='text-base'>Or <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'>Upload 
                {/* Hidden file input - clicking the label triggers file selection */}
                <input 
                    onChange={(e) => {
                        // Get the selected file and pass it to parent component
                        const tempFile = e.target.files[0]
                        setFile(tempFile)
                    }} 
                    className='hidden' 
                    type='file' 
                    accept='.mp3,.mp4'  // Only allow audio/video files
                />
            </label> a mp3/mp4 file</p>
            
        </main>
    )
}