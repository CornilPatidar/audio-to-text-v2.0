import { useRef, useEffect, useState } from 'react';

export default function FileDisplay(props) {
    const { handleAudioReset, file, audioStream, handleFormSubmission } = props;
    const audioRef = useRef();
    const [audioSrc, setAudioSrc] = useState(null);

    useEffect(() => {
        if (!file && !audioStream) return;

        let currentAudioSrc; // Variable to hold the current audio source

        if (file) {
            console.log('HERE FILE', file);
            const fileUrl = URL.createObjectURL(file);
            setAudioSrc(fileUrl);
            audioRef.current.src = fileUrl;
            currentAudioSrc = fileUrl;
        } else {
            console.log('HERE AUDIO', audioStream);
            const streamUrl = URL.createObjectURL(audioStream);
            setAudioSrc(streamUrl);
            audioRef.current.src = streamUrl;
            currentAudioSrc = streamUrl;
        }

        // Clean up the object URL when the component unmounts
        return () => {
            if (currentAudioSrc) URL.revokeObjectURL(currentAudioSrc);
        };
    }, [audioStream, file]);

    return (
        <main className="flex-1 p-4 flex flex-col gap-4 text-center sm:gap-6 justify-center pb-20 w-full max-w-prose mx-auto">
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                Your <span className="text-red-400 bold">File</span>
            </h1>
            <div className='flex flex-col text-left my-4'>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Name</h3>
                        <p className="truncate">{file ? file.name : 'Custom audio'}</p>
                    </div>
                    <button
                    onClick={handleAudioReset}
                    className="text-slate-400 hover:text-red-600 duration-200"
                >
                    Reset
                </button>
                </div>
            </div>
            <div className="flex flex-col mb-2">
                <audio ref={audioRef} className="w-full" controls controlsList="nodownload">
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div className="flex items-center justify-between gap-4">
                {audioSrc && (
                        <a
                            href={audioSrc}
                            download={file ? `${file.name}.mp3` : 'custom_audio.mp3'}
                            className="specialBtn px-3 p-2 rounded-lg text-red-400 flex items-center gap-2 font-medium"
                        >
                            <p>Download</p>
                            <i className="fa-solid fa-download"></i>
                        </a>
                    )}
                <button
                    onClick={() => {
                        console.log('🎯 Transcribe button clicked in FileDisplay component')
                        handleFormSubmission()
                    }}
                    className="specialBtn px-3 p-2 rounded-lg text-red-400 flex items-center gap-2 font-medium"
                >
                    <p>Transcribe</p>
                    <i className="fa-solid fa-pen-nib"></i>
                </button>
            </div>
        </main>
    );
}
