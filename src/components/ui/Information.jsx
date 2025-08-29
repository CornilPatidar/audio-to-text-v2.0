import React from 'react'
import Transcription from './Transcription'
import ExportOptions from '../features/ExportOptions'

export default function Information(props) {
    const { output, finished, jobId, worker, apiKey } = props
    console.log('📊 Information component - output:', output)
    console.log('📊 Information component - finished:', finished)

    const textElement = output && Array.isArray(output) && output.length > 0 ? 
        output.map(val => val.text).join(' ') : 
        'No transcription available. Please check your audio file.'

    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }

    function handleExportSuccess(format, filename) {
        console.log(`✅ Exported successfully as ${format}: ${filename}`)
    }






    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>Your <span className='text-red-400 bold'>Transcription</span></h1>


            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {!finished && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                )}
                <Transcription {...props} textElement={textElement} />
            </div>
            <div className='flex items-center gap-4 mx-auto'>
                <button onClick={handleCopy} title="Copy to clipboard" className='bg-white hover:text-red-500 duration-200 text-red-300 px-3 py-2 rounded flex items-center gap-2'>
                    <i className="fa-solid fa-copy"></i>
                    <span className="hidden sm:inline">Copy</span>
                </button>
                <ExportOptions 
                    segments={output} 
                    onExport={handleExportSuccess}
                    jobId={jobId}
                    worker={worker}
                    apiKey={apiKey}
                />
            </div>
        </main>
    )
}