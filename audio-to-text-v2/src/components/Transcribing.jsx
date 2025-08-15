// Import React for component creation
import React from 'react'

/**
 * Transcribing Component - Loading screen during audio transcription process
 * 
 * This component displays a loading interface while the audio transcription is in progress.
 * It provides visual feedback to users with animated loading bars and status messages
 * that change based on the current stage of the transcription process.
 * 
 * The component shows different messages for different stages:
 * - "Preparing transcription..." when initially preparing
 * - "Processing audio..." when actively downloading/processing
 */
function Transcribing(props) {
    // Destructure props to get the downloading status
    const {
        downloading  // Boolean indicating if transcription models are being downloaded
    } = props
    
    return (
        // Main container with centered, responsive layout and full height
        <div className='flex items-center flex-col justify-center gap-10 md:gap-14 pb-24 p-4 text-center flex-1'>
            
            {/* Header section with title and status message */}
            <div className="flex flex-col gap-2 sm:gap-4">
                {/* Main title with brand styling */}
                <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                    <span className="text-blue-400 bold ">Transcribing</span>
                </h1>
                
                {/* Dynamic status message based on transcription stage */}
                <p className="font-semibold">
                    {!downloading ? "Preparing transcription..." : "Processing audio..."}
                </p>
            </div>
            
            {/* Animated loading bars section */}
            <div className="flex flex-col gap-2 sm:gap-4 mx-auto w-full max-w-[400px] ">
                {/* Create 3 animated loading bars using array mapping */}
                {[0,1,2].map(
                    val => {
                        return (
                            <div 
                                key={val} 
                                className={"rounded-full  h-2 sm:h3 bg-slate-400 loading "+ `loading${val}`}
                            >
                                {/* Each bar has a unique loading animation class for staggered effect */}
                            </div>
                        )
                    }
                )}
            </div>
        </div>
    )
}

export default Transcribing