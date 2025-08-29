import React from 'react'

function Transcribing(props) {
    const { processingStatus, onCancel } = props
    
    const getStatusIcon = (stage) => {
        switch (stage) {
            case 'preparing': return '🔄'
            case 'starting': return '🚀'
            case 'downloading': return '📥'
            case 'loading': return '⚡'
            case 'transcribing': return '🎯'
            case 'complete': return '✅'
            case 'error': return '❌'
            case 'cancelled': return '⏹️'
            default: return '🎤'
        }
    }

    const message = processingStatus?.message || 'Initializing'
    const details = processingStatus?.details || 'Please wait...'
    const progress = processingStatus?.progress || 0
    const stage = processingStatus?.stage || 'preparing'

    return (
        <div className='flex items-center flex-col justify-center gap-10 md:gap-14 pb-24 p-4 text-center flex-1'>
            <div className="flex flex-col gap-2 sm:gap-4">
                <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                    <span className="text-red-400 bold">Transcribing</span>
                </h1>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-lg flex items-center justify-center gap-2">
                        <span className="text-xl">{getStatusIcon(stage)}</span>
                        {message}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                        {details}
                    </p>
                </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full max-w-[400px] bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(5, progress * 100)}%` }}
                ></div>
            </div>
            
            {/* Animated loading bars */}
            <div className="flex flex-col gap-2 sm:gap-4 mx-auto w-full max-w-[400px] opacity-60">
                {[0,1,2].map(val => {
                    return (
                        <div 
                            key={val} 
                            className={`rounded-full h-2 sm:h-3 bg-slate-400 loading loading${val}`}
                        ></div>
                    )
                })}
            </div>
            
            {onCancel && (
                <button 
                    onClick={onCancel}
                    className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg duration-200 flex items-center gap-2'
                    title="Cancel transcription"
                >
                    <i className="fa-solid fa-stop"></i>
                    Cancel
                </button>
            )}
        </div>
    )
}

export default Transcribing