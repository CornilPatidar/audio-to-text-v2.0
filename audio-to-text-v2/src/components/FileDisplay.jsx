import { useRef, useEffect, useState } from 'react'; // Import React hooks for component state and lifecycle management

/**
 * FileDisplay Component - Displays audio file/stream with playback controls and transcription options
 * 
 * This component handles both uploaded audio files and recorded audio streams,
 * providing a user interface to preview, download, and transcribe audio content.
 */
export default function FileDisplay(props) {
    
    // Destructure props passed from parent component
    const { 
        handleAudioReset,     // Function to reset/clear the current audio
        file,                 // Audio file object (from file upload)
        audioStream,          // Audio stream blob (from recording)
        handleFormSubmission  // Function to start transcription process
    } = props;
    
    // Create a ref to directly access the audio DOM element
    const audioRef = useRef();
    
    // State to store the audio source URL for download functionality
    const [audioSrc, setAudioSrc] = useState(null);

    // Effect hook to handle audio source creation when file or audioStream changes
    useEffect(() => {
        // Exit early if neither file nor audioStream is provided
        if (!file && !audioStream) return;

        let currentAudioSrc; // Variable to hold the current audio source for cleanup

        if (file) {
            // Handle uploaded file: create object URL from file blob
            console.log('Processing uploaded file:', file);
            const fileUrl = URL.createObjectURL(file);
            setAudioSrc(fileUrl);           // Store URL for download link
            audioRef.current.src = fileUrl; // Set audio element source
            currentAudioSrc = fileUrl;
        } else {
            // Handle recorded audio stream: create object URL from stream blob
            console.log('Processing recorded audio stream:', audioStream);
            const streamUrl = URL.createObjectURL(audioStream);
            setAudioSrc(streamUrl);           // Store URL for download link
            audioRef.current.src = streamUrl; // Set audio element source
            currentAudioSrc = streamUrl;
        }

        // Cleanup function: revoke object URL to prevent memory leaks
        // This runs when component unmounts or when dependencies change
        return () => {
            if (currentAudioSrc) URL.revokeObjectURL(currentAudioSrc);
        };
    }, [audioStream, file]); // Re-run effect when audio source changes

    // Render the file display UI with audio player and controls
    return (
        // Main container with responsive layout and centered content
        <main className="flex-1 p-4 flex flex-col gap-4 text-center sm:gap-6 justify-center pb-20 w-full max-w-prose mx-auto">
  
            {/* Page header with styled title */}
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                Your <span className="text-blue-400 bold">File</span>
            </h1>
            
            {/* File information section with name display and reset button */}
            <div className='flex flex-col text-left my-4'>
                <div className="flex justify-between items-center">
                    {/* File name display */}
                    <div>
                        <h3 className="font-semibold">Name</h3>
                        {/* Show file name if uploaded file, otherwise show 'Custom audio' for recorded audio */}
                        <p className="truncate">{file ? file.name : 'Custom audio'}</p>
                    </div>
                    {/* Reset button to clear current audio and return to previous state */}
                    <button onClick={handleAudioReset}
                    className="text-slate-400 hover:text-blue-600 duration-200">
                    Reset
                </button>
                </div>
            </div>
            
            {/* Audio player section */}
            <div className="flex flex-col mb-2">
                {/* HTML5 audio element with playback controls - controlsList="nodownload" removes the download option from browser's default controls */}
                <audio ref={audioRef} className="w-full" controls controlsList="nodownload">
                    {/* Fallback message for browsers that don't support audio element */}
                    Your browser does not support the audio element.
                </audio>
            </div>
            
            {/* Action buttons section */}
            <div className="flex items-center justify-between gap-4">
                {/* Download button - only shown when audio source is available */}
                {audioSrc && (
                        <a
                            href={audioSrc}
                            download={file ? `${file.name}.mp3` : 'custom_audio.mp3'} // Use original filename or default name
                            className="specialBtn px-3 p-2 rounded-lg text-blue-400 flex items-center gap-2 font-medium"
                        >
                            <p>Download</p>
                            <i className="fa-solid fa-download"></i>
                        </a>
                    )}
                
                {/* Transcribe button - initiates the transcription process */}
                <button
                    onClick={handleFormSubmission}
                    className="specialBtn px-3 p-2 rounded-lg text-blue-400 flex items-center gap-2 font-medium"
                >
                    <p>Transcribe</p>
                    <i className="fa-solid fa-pen-nib"></i>
                </button>
            </div>
        </main>
    );
}