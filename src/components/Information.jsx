import React from 'react'
import Transcription from './Transcription'

export default function Information(props) {
    const { output, finished } = props
    console.log('📊 Information component - output:', output)
    console.log('📊 Information component - finished:', finished)

    const textElement = output && Array.isArray(output) && output.length > 0 ? 
        output.map(val => val.text).join(' ') : 
        'No transcription available. Please check your audio file.'

    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }

    function handleDownload() {
        const element = document.createElement("a")
        const file = new Blob([textElement], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `AudioTextly_${new Date().toString()}.txt`
        document.body.appendChild(element)
        element.click()
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
            <div className='flex items-center gap-4 mx-auto '>
                <button onClick={handleCopy} title="Copy" className='bg-white  hover:text-red-500 duration-200 text-red-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-copy"></i>
                </button>
                <button onClick={handleDownload} title="Download" className='bg-white  hover:text-red-500 duration-200 text-red-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-download"></i>
                </button>
            </div>
        </main>
    )
}