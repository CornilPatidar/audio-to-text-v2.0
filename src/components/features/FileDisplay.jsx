import { useRef, useEffect, useState } from 'react';

export default function FileDisplay(props) {
    const { handleAudioReset, file, audioStream, handleFormSubmission, isTranscribing } = props;
    const audioRef = useRef();
    const [audioSrc, setAudioSrc] = useState(null);
    const [fileQuality, setFileQuality] = useState(null);
    const [customVocabulary, setCustomVocabulary] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [openTooltips, setOpenTooltips] = useState({
        model: false,
        rush: false,
        verbatim: false,
        human: false,
        vocabulary: false
    });
    const [advancedOptions, setAdvancedOptions] = useState({
        rush: false,
        verbatim: false,
        humanTranscription: false,
        model: 'reverb' // 'reverb' or 'reverb_turbo'
    });

    // File size limits (in bytes)
    const FILE_SIZE_LIMITS = {
        FORM_DATA: 2 * 1024 * 1024 * 1024, // 2GB
        SOURCE_CONFIG: 5 * 1024 * 1024 * 1024 * 1024 // 5TB
    };

    const toggleTooltip = (tooltipKey) => {
        setOpenTooltips(prev => ({
            ...prev,
            [tooltipKey]: !prev[tooltipKey]
        }));
    };

    // Function to analyze file quality
    const analyzeFileQuality = (file) => {
        if (!file) return null;
        
        const quality = {
            format: file.name.split('.').pop().toLowerCase(),
            size: file.size,
            sizeMB: (file.size / (1024 * 1024)).toFixed(2),
            isRecommended: false,
            recommendations: [],
            errors: []
        };

        // Check file size limits
        if (file.size > FILE_SIZE_LIMITS.FORM_DATA) {
            quality.errors.push(`❌ File too large (${quality.sizeMB} MB). Maximum size is 2GB for direct upload.`);
        } else if (file.size > 100 * 1024 * 1024) { // 100MB warning
            quality.recommendations.push('⚠️ Large file - may take longer to upload and process');
        }

        // Check format recommendations
        const losslessFormats = ['flac', 'alac', 'wav', 'pcm'];
        const goodFormats = ['mp3', 'aac', 'ogg', 'm4a'];
        
        if (losslessFormats.includes(quality.format)) {
            quality.isRecommended = true;
            quality.recommendations.push('✅ Lossless format - excellent quality');
        } else if (goodFormats.includes(quality.format)) {
            quality.isRecommended = true;
            quality.recommendations.push('✅ Good format - suitable for transcription');
        } else {
            quality.recommendations.push('⚠️ Format may affect quality - consider converting to FLAC or MP3');
        }

        // Check file size
        if (quality.sizeMB < 0.1) {
            quality.recommendations.push('⚠️ Very small file - may be low quality');
        }

        return quality;
    };

    useEffect(() => {
        if (!file && !audioStream) return;

        let currentAudioSrc; // Variable to hold the current audio source

        if (file) {
            console.log('HERE FILE', file);
            const fileUrl = URL.createObjectURL(file);
            setAudioSrc(fileUrl);
            audioRef.current.src = fileUrl;
            currentAudioSrc = fileUrl;
            
            // Analyze file quality
            setFileQuality(analyzeFileQuality(file));
        } else {
            console.log('HERE AUDIO', audioStream);
            const streamUrl = URL.createObjectURL(audioStream);
            setAudioSrc(streamUrl);
            audioRef.current.src = streamUrl;
            currentAudioSrc = streamUrl;
            
            // For recorded audio, assume good quality (16kHz, controlled environment)
            setFileQuality({
                format: 'webm',
                size: audioStream.size,
                sizeMB: (audioStream.size / (1024 * 1024)).toFixed(2),
                isRecommended: true,
                recommendations: ['✅ Recorded at 16kHz - optimal for transcription'],
                errors: []
            });
        }

        // Clean up the object URL when the component unmounts
        return () => {
            if (currentAudioSrc) URL.revokeObjectURL(currentAudioSrc);
        };
    }, [audioStream, file]);

    const handleTranscribe = () => {
        if (!isTranscribing) {
            console.log('🎯 Transcribe button clicked in FileDisplay component');
            
            // Check for file size errors
            if (fileQuality && fileQuality.errors.length > 0) {
                alert('Cannot transcribe: ' + fileQuality.errors.join('\n'));
                return;
            }

            // Pass transcription data with advanced options
            const transcriptionData = {
                customVocabulary: customVocabulary.trim() ? customVocabulary.trim().split(',').map(word => word.trim()) : [],
                ...advancedOptions
            };
            handleFormSubmission(transcriptionData);
        }
    };

    const getModelInfo = (model) => {
        switch (model) {
            case 'reverb':
                return { name: 'Reverb ASR (machine)', price: '$0.20/hour', speed: 'Standard', description: 'Default machine transcription' };
            case 'reverb_turbo':
                return { name: 'Reverb Turbo (low_cost)', price: '$0.10/hour', speed: 'Faster', description: 'Quantized ASR model' };
            default:
                return { name: 'Reverb ASR (machine)', price: '$0.20/hour', speed: 'Standard', description: 'Default machine transcription' };
        }
    };

    const currentModel = getModelInfo(advancedOptions.model);

    return (
        <main className="flex-1 p-4 flex flex-col gap-4 text-center sm:gap-6 justify-center pb-20 w-full max-w-prose mx-auto">
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">
                Your <span className="text-red-400 bold">File</span>
            </h1>
            
            {/* File Information */}
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
                
                {/* File Quality Indicator */}
                {fileQuality && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                        fileQuality.errors.length > 0 
                            ? 'bg-red-50 border-red-200' 
                            : fileQuality.isRecommended 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-yellow-50 border-yellow-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <i className={`fa-solid ${
                                fileQuality.errors.length > 0 
                                    ? 'fa-exclamation-circle text-red-600' 
                                    : fileQuality.isRecommended 
                                        ? 'fa-check-circle text-green-600' 
                                        : 'fa-exclamation-triangle text-yellow-600'
                            }`}></i>
                            <span className="font-semibold text-sm">
                                {fileQuality.errors.length > 0 
                                    ? 'File Issues' 
                                    : fileQuality.isRecommended 
                                        ? 'Good Quality' 
                                        : 'Quality Check'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>Format: {fileQuality.format.toUpperCase()} • Size: {fileQuality.sizeMB} MB</p>
                            {fileQuality.errors.map((error, index) => (
                                <p key={index} className="text-red-600 font-medium">{error}</p>
                            ))}
                            {fileQuality.recommendations.map((rec, index) => (
                                <p key={index}>{rec}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Audio Player */}
            <div className="flex flex-col mb-2">
                <audio ref={audioRef} className="w-full" controls controlsList="nodownload">
                    Your browser does not support the audio element.
                </audio>
            </div>

            {/* Advanced Options */}
            <div className="max-w-md mx-auto w-full">
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className='text-sm text-gray-500 hover:text-red-400 duration-200 flex items-center gap-2 mx-auto mb-2'
                >
                    <i className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
                    Advanced Options
                </button>
                {showAdvanced && (
                    <div className='bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-4'>
                        {/* Model Selection */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className='block text-sm font-medium text-gray-700'>
                                    Transcription Model
                                </label>
                                <button
                                    onClick={() => toggleTooltip('model')}
                                    className="text-gray-400 hover:text-red-400 duration-200 transition-colors"
                                >
                                    <i className={`fa-solid fa-chevron-${openTooltips.model ? 'up' : 'right'} text-xs`}></i>
                                </button>
                            </div>
                            {openTooltips.model && (
                                <div className="mb-3 p-3 bg-white rounded border text-xs text-gray-600">
                                    <p className="font-medium mb-2">Model Comparison:</p>
                                    <p><strong>Reverb ASR (machine):</strong> Default machine transcription, best accuracy ($0.20/hour)</p>
                                    <p><strong>Reverb Turbo (low_cost):</strong> Quantized ASR model, faster processing ($0.10/hour)</p>
                                    <p className="mt-2"><strong>Choose Turbo:</strong> Quick results, cost-effective</p>
                                    <p><strong>Choose ASR:</strong> Best accuracy for important content</p>
                                    <p className="mt-2 text-gray-500">Note: Both are machine transcription. For highest accuracy, use Human transcription below.</p>
                                </div>
                            )}
                            <select
                                value={advancedOptions.model}
                                onChange={(e) => setAdvancedOptions(prev => ({ ...prev, model: e.target.value }))}
                                className='w-full p-2 border border-gray-300 rounded text-sm'
                            >
                                <option value="reverb">Reverb ASR - $0.20/hour (Standard)</option>
                                <option value="reverb_turbo">Reverb Turbo - $0.10/hour (Faster)</option>
                            </select>
                            <p className='text-xs text-gray-500 mt-1'>
                                Selected: {currentModel.name} - {currentModel.price} ({currentModel.speed})
                            </p>
                        </div>

                        {/* Processing Options */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTooltip('rush')}>
                                <input 
                                    type='checkbox' 
                                    checked={advancedOptions.rush} 
                                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, rush: e.target.checked }))}
                                    className='rounded'
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className='flex items-center gap-1 text-sm group-hover:text-red-400 duration-200'>
                                    Rush processing (+$1.25/minute)
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTooltip('rush'); }}
                                        className="text-gray-400 hover:text-red-400 duration-200 transition-colors"
                                    >
                                        <i className={`fa-solid fa-chevron-${openTooltips.rush ? 'up' : 'right'} text-xs`}></i>
                                    </button>
                                </span>
                            </div>
                            {openTooltips.rush && (
                                <div className="ml-6 mb-3 p-3 bg-white rounded border text-xs text-gray-600">
                                    <p className="font-medium mb-2">Moves your job to the front of the line for faster processing</p>
                                    <p className="font-medium">Perfect for:</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Breaking news interviews</li>
                                        <li>Urgent medical dictations</li>
                                        <li>Client deadlines</li>
                                        <li>Board presentations</li>
                                    </ul>
                                    <p className="mt-2"><strong>Example:</strong> 30-min file costs extra $37.50</p>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTooltip('verbatim')}>
                                <input 
                                    type='checkbox' 
                                    checked={advancedOptions.verbatim} 
                                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, verbatim: e.target.checked }))}
                                    className='rounded'
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className='flex items-center gap-1 text-sm group-hover:text-red-400 duration-200'>
                                    Verbatim transcription (+$0.50/minute)
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTooltip('verbatim'); }}
                                        className="text-gray-400 hover:text-red-400 duration-200 transition-colors"
                                    >
                                        <i className={`fa-solid fa-chevron-${openTooltips.verbatim ? 'up' : 'right'} text-xs`}></i>
                                    </button>
                                </span>
                            </div>
                            {openTooltips.verbatim && (
                                <div className="ml-6 mb-3 p-3 bg-white rounded border text-xs text-gray-600">
                                    <p className="font-medium mb-2">Includes every 'um,' 'uh,' false starts, and stutters</p>
                                    <p className="mb-2"><strong>Normal:</strong> "I think we should proceed with the project."</p>
                                    <p className="mb-2"><strong>Verbatim:</strong> "I, uh, I think we should, um, proceed with the project."</p>
                                    <p className="font-medium">Perfect for:</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Legal depositions</li>
                                        <li>Research interviews</li>
                                        <li>Speech pattern analysis</li>
                                        <li>Reality TV editing</li>
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTooltip('human')}>
                                <input 
                                    type='checkbox' 
                                    checked={advancedOptions.humanTranscription} 
                                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, humanTranscription: e.target.checked }))}
                                    className='rounded'
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className='flex items-center gap-1 text-sm group-hover:text-red-400 duration-200'>
                                    Human transcription ($1.99/minute)
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTooltip('human'); }}
                                        className="text-gray-400 hover:text-red-400 duration-200 transition-colors"
                                    >
                                        <i className={`fa-solid fa-chevron-${openTooltips.human ? 'up' : 'right'} text-xs`}></i>
                                    </button>
                                </span>
                            </div>
                            {openTooltips.human && (
                                <div className="ml-6 mb-3 p-3 bg-white rounded border text-xs text-gray-600">
                                    <p className="font-medium mb-2">Real person listens and types - much more accurate</p>
                                    <p className="font-medium">Perfect for:</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Medical records (drug names, technical terms)</li>
                                        <li>Legal proceedings (every word matters)</li>
                                        <li>Strong accents or background noise</li>
                                        <li>Complex technical discussions</li>
                                    </ul>
                                    <p className="mt-2"><strong>Trade-offs:</strong></p>
                                    <p>✅ 10-20x more accurate</p>
                                    <p>❌ Costs more, takes 12-24 hours</p>
                                    <p className="mt-2"><strong>Example:</strong> 30-min file costs $59.70</p>
                                </div>
                            )}
                        </div>

                        {/* Custom Vocabulary */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className='block text-sm font-medium text-gray-700'>
                                    Custom Vocabulary (optional)
                                </label>
                                <button
                                    onClick={() => toggleTooltip('vocabulary')}
                                    className="text-gray-400 hover:text-red-400 duration-200 transition-colors"
                                >
                                    <i className={`fa-solid fa-chevron-${openTooltips.vocabulary ? 'up' : 'right'} text-xs`}></i>
                                </button>
                            </div>
                            {openTooltips.vocabulary && (
                                <div className="mb-3 p-3 bg-white rounded border text-xs text-gray-600">
                                    <p className="font-medium mb-2">Helps AI recognize unusual words it might not know</p>
                                    <p className="font-medium">Examples:</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Company names: 'Salesforce, Shopify, Xero'</li>
                                        <li>People's names: 'Siobhan, Rajesh, Ng Wei Ming'</li>
                                        <li>Technical terms: 'kubernetes, cytokine, acetaminophen'</li>
                                        <li>Industry jargon: 'SKU, API, CRM, KPI'</li>
                                    </ul>
                                    <p className="mt-2"><strong>Without:</strong> "The CEO of Ah-mahz-on discussed..."</p>
                                    <p><strong>With:</strong> "The CEO of Amazon discussed..."</p>
                                </div>
                            )}
                            <textarea
                                value={customVocabulary}
                                onChange={(e) => setCustomVocabulary(e.target.value)}
                                placeholder="Enter technical terms, names, or uncommon words separated by commas..."
                                className='w-full p-2 border border-gray-300 rounded text-sm resize-none'
                                rows="3"
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                                Helps improve recognition of specific terms, proper names, or technical vocabulary
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
                {audioSrc && (
                    <a
                        href={audioSrc}
                        download={file ? file.name : 'custom_audio.webm'}
                        className="specialBtn px-3 p-2 rounded-lg text-red-400 flex items-center gap-2 font-medium"
                    >
                        <p>Download</p>
                        <i className="fa-solid fa-download"></i>
                    </a>
                )}
                <button
                    onClick={handleTranscribe}
                    disabled={isTranscribing || (fileQuality && fileQuality.errors.length > 0)}
                    className={`specialBtn px-3 p-2 rounded-lg flex items-center gap-2 font-medium ${
                        isTranscribing || (fileQuality && fileQuality.errors.length > 0)
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-400 hover:text-red-600'
                    }`}
                >
                    <p>{isTranscribing ? 'Processing...' : 'Transcribe'}</p>
                    <i className={`fa-solid ${isTranscribing ? 'fa-spinner animate-spin' : 'fa-pen-nib'}`}></i>
                </button>
            </div>
        </main>
    );
}
