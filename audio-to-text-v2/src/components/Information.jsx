// Import React hooks for state management, effects, and refs
import React, { useState, useEffect, useRef } from 'react'
// Import child components for displaying transcription and translation content
import Transcription from './Transcription'
import Translation from './Translation'

/**
 * Information Component - Displays transcription results with translation capabilities
 * 
 * This component serves as the main interface for viewing and managing transcribed audio content.
 * It provides two main functionalities:
 * 1. Displays the original transcription text
 * 2. Offers translation services using a web worker for performance
 * 
 * Features include:
 * - Tab-based interface switching between transcription and translation
 * - Copy to clipboard functionality
 * - Download text as file
 * - Real-time translation using ML models in a web worker
 */
export default function Information(props) {
    // Destructure props from parent component
    const { 
        output,   // Array of transcription segments with text and timing
        finished  // Boolean indicating if transcription process is complete
    } = props
    
    // State for managing the active tab (transcription or translation)
    const [tab, setTab] = useState('transcription')
    
    // State for storing the translated text content
    const [translation, setTranslation] = useState(null)
    
    // State for the target language selection
    const [toLanguage, setToLanguage] = useState('Select language')
    
    // State for tracking translation process status
    const [translating, setTranslating] = useState(null)
    
    console.log(output)

    // Ref to store the web worker instance for translation processing
    const worker = useRef()

    /**
     * Effect hook to set up and manage the translation web worker
     * 
     * This creates a web worker that runs translation models in a separate thread
     * to avoid blocking the main UI thread during computationally intensive translations.
     * The worker handles loading ML models and processing translation requests.
     */
    useEffect(() => {
        // Initialize web worker if it doesn't exist
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
                type: 'module'  // Use ES6 modules in the worker
            })
        }

        /**
         * Handle messages received from the translation web worker
         * 
         * The worker sends different status updates during the translation process:
         * - initiate: Starting to download translation models
         * - progress: Model loading progress updates
         * - update: Partial or complete translation results
         * - complete: Translation process finished
         */
        const onMessageReceived = async (e) => {
            switch (e.data.status) {
                case 'initiate':
                    // Translation model download has started
                    console.log('DOWNLOADING')
                    break;
                case 'progress':
                    // Model is still loading (could show progress bar here)
                    console.log('LOADING')
                    break;
                case 'update':
                    // Received translated text - update the UI
                    setTranslation(e.data.output)
                    console.log(e.data.output)
                    break;
                case 'complete':
                    // Translation finished - stop loading indicator
                    setTranslating(false)
                    console.log("DONE")
                    break;
            }
        }

        // Set up event listener for worker messages
        worker.current.addEventListener('message', onMessageReceived)

        // Cleanup function: remove event listener when component unmounts
        return () => worker.current.removeEventListener('message', onMessageReceived)
    })

    // Determine which text content to display based on active tab
    // For transcription: join all transcription segments into one string
    // For translation: use translated text or empty string if not available
    const textElement = tab === 'transcription' ? output.map(val => val.text) : translation || ''

    /**
     * Copy the current text content to the user's clipboard
     * 
     * Uses the modern Clipboard API to copy either transcription or translation text
     * depending on which tab is currently active.
     */
    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }

    /**
     * Download the current text content as a .txt file
     * 
     * Creates a downloadable text file containing either the transcription or translation.
     * The file is automatically named with timestamp for uniqueness.
     */
    function handleDownload() {
        // Create a temporary anchor element for download
        const element = document.createElement("a")
        
        // Create a blob containing the text content
        const file = new Blob([textElement], { type: 'text/plain' })
        
        // Create object URL for the blob and set download attributes
        element.href = URL.createObjectURL(file)
        element.download = `Freescribe_${new Date().toString()}.txt`
        
        // Trigger the download by programmatically clicking the link
        document.body.appendChild(element)
        element.click()
    }

    /**
     * Initiate translation process using the web worker
     * 
     * Sends the transcription text to the web worker for translation.
     * Validates that a target language is selected and translation isn't already in progress.
     * The worker will handle the heavy ML processing in a separate thread.
     */
    function generateTranslation() {
        // Prevent translation if already in progress or no language selected
        if (translating || toLanguage === 'Select language') {
            return
        }

        // Set translation status to show loading indicator
        setTranslating(true)

        // Send translation request to web worker
        worker.current.postMessage({
            text: output.map(val => val.text),  // Extract text from transcription segments
            src_lang: 'eng_Latn',              // Source language (English Latin script)
            tgt_lang: toLanguage                // Target language selected by user
        })
    }

    // Render the information display interface with transcription and translation capabilities
    return (
        // Main container with centered, responsive layout
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            {/* Page title */}
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>Your <span className='text-blue-400 bold'>Transcription</span></h1>

            {/* Tab switcher for transcription vs translation views */}
            <div className='grid grid-cols-2 sm:mx-auto bg-white  rounded overflow-hidden items-center p-1 blueShadow border-[2px] border-solid border-blue-300'>
                {/* Transcription tab button */}
                <button 
                    onClick={() => setTab('transcription')} 
                    className={'px-4 rounded duration-200 py-1 ' + (tab === 'transcription' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}
                >
                    Transcription
                </button>
                {/* Translation tab button */}
                <button 
                    onClick={() => setTab('translation')} 
                    className={'px-4 rounded duration-200 py-1  ' + (tab === 'translation' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}
                >
                    Translation
                </button>
            </div>
            
            {/* Content area for displaying transcription or translation */}
            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {/* Loading spinner - shown when transcription not finished or translation in progress */}
                {(!finished || translating) && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                )}
                
                {/* Conditional rendering based on active tab */}
                {tab === 'transcription' ? (
                    // Render transcription component with current text
                    <Transcription {...props} textElement={textElement} />
                ) : (
                    // Render translation component with all translation controls and state
                    <Translation 
                        {...props} 
                        toLanguage={toLanguage} 
                        translating={translating} 
                        textElement={textElement} 
                        setTranslating={setTranslating} 
                        setTranslation={setTranslation} 
                        setToLanguage={setToLanguage} 
                        generateTranslation={generateTranslation} 
                    />
                )}
            </div>
            
            {/* Action buttons for copy and download functionality */}
            <div className='flex items-center gap-4 mx-auto '>
                {/* Copy to clipboard button */}
                <button 
                    onClick={handleCopy} 
                    title="Copy" 
                    className='bg-white  hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'
                >
                    <i className="fa-solid fa-copy"></i>
                </button>
                {/* Download as text file button */}
                <button 
                    onClick={handleDownload} 
                    title="Download" 
                    className='bg-white  hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'
                >
                    <i className="fa-solid fa-download"></i>
                </button>
            </div>
        </main>
    )
}