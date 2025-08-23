import React, { useState, useEffect } from 'react'
import { 
    exportAsTXT, 
    exportAsJSON, 
    exportAsSRT, 
    exportAsVTT, 
    exportAsDOCX, 
    exportAsPDF,
    getMimeType,
    generateFilename
} from '../utils/exportFormats'

export default function ExportOptions({ segments, onExport, jobId, worker, apiKey }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState('right')

    const exportFormats = [
        { key: 'txt', label: 'Plain Text (.txt)', icon: 'fa-file-lines', description: 'Simple text format' },
        { key: 'json', label: 'JSON (.json)', icon: 'fa-file-code', description: 'Structured data with timestamps' },
        { key: 'srt', label: 'SubRip (.srt)', icon: 'fa-closed-captioning', description: 'Subtitle format for video players' },
        { key: 'vtt', label: 'WebVTT (.vtt)', icon: 'fa-closed-captioning', description: 'Web video text tracks' },
        { key: 'revai_srt', label: 'Rev AI SRT (.srt)', icon: 'fa-closed-captioning', description: 'Native Rev AI subtitle format', isRevAI: true },
        { key: 'revai_vtt', label: 'Rev AI VTT (.vtt)', icon: 'fa-closed-captioning', description: 'Native Rev AI web video tracks', isRevAI: true },
        { key: 'docx', label: 'Word Document (.html)', icon: 'fa-file-word', description: 'HTML file that opens in Word' },
        { key: 'pdf', label: 'PDF (.pdf)', icon: 'fa-file-pdf', description: 'Portable document format' }
    ]

    // Cleanup function to remove body class when component unmounts
    useEffect(() => {
        const handleResize = () => {
            if (isOpen) {
                setIsOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        
        return () => {
            document.body.classList.remove('dropdown-above')
            window.removeEventListener('resize', handleResize)
        }
    }, [isOpen])

    const handleDropdownToggle = () => {
        if (!isOpen) {
            // Calculate position before opening
            const button = document.querySelector('[data-export-button]')
            if (button) {
                const rect = button.getBoundingClientRect()
                const viewportWidth = window.innerWidth
                const viewportHeight = window.innerHeight
                const dropdownWidth = window.innerWidth < 640 ? 288 : 320 // w-72 = 288px, w-80 = 320px
                const dropdownHeight = 240 // Approximate height of dropdown
                
                // Check if dropdown would go off the right edge
                if (rect.right + dropdownWidth > viewportWidth) {
                    // Check if it would also go off the left edge
                    if (rect.left - dropdownWidth < 0) {
                        setDropdownPosition('center')
                    } else {
                        setDropdownPosition('left')
                    }
                } else {
                    setDropdownPosition('right')
                }
                
                // Check if dropdown would go below viewport
                if (rect.bottom + dropdownHeight > viewportHeight) {
                    // Add a class to position dropdown above the button
                    document.body.classList.add('dropdown-above')
                } else {
                    document.body.classList.remove('dropdown-above')
                }
            }
        }
        setIsOpen(!isOpen)
    }

    const handleExport = async (format) => {
        if (!segments || segments.length === 0) {
            alert('No transcription data available to export')
            return
        }

        setIsExporting(true)
        setIsOpen(false)

        try {
            let content
            let filename = generateFilename(format)

            // Handle Rev AI native caption formats
            if (format === 'revai_srt' || format === 'revai_vtt') {
                if (!jobId || !worker || !apiKey) {
                    throw new Error('Rev AI native captions require a completed transcription job. Please complete a transcription first.')
                }

                const captionFormat = format === 'revai_srt' ? 'srt' : 'vtt'
                
                // Request captions from Rev AI
                worker.postMessage({
                    type: 'CAPTIONS_REQUEST',
                    jobId: jobId,
                    captionFormat: captionFormat,
                    apiKey: apiKey
                })

                // Set up a one-time listener for the response
                const handleCaptionResponse = (event) => {
                    if (event.data.type === 'CAPTIONS_RESULT' && event.data.captions) {
                        // Create and download file
                        const blob = new Blob([event.data.captions], { type: getMimeType(captionFormat) })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = filename
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)

                        // Call the onExport callback if provided
                        if (onExport) {
                            onExport(format, filename)
                        }

                        // Show success message
                        setShowSuccess(true)
                        setTimeout(() => setShowSuccess(false), 3000)
                        setIsExporting(false)

                        // Remove the listener
                        worker.removeEventListener('message', handleCaptionResponse)
                    } else if (event.data.type === 'LOADING' && event.data.status === 'error') {
                        alert(`Failed to export Rev AI captions: ${event.data.error}`)
                        setIsExporting(false)
                        worker.removeEventListener('message', handleCaptionResponse)
                    }
                }

                worker.addEventListener('message', handleCaptionResponse)
                return
            }

            // Handle local export formats
            switch (format) {
                case 'txt':
                    content = exportAsTXT(segments)
                    break
                case 'json':
                    content = exportAsJSON(segments)
                    break
                case 'srt':
                    content = exportAsSRT(segments)
                    break
                case 'vtt':
                    content = exportAsVTT(segments)
                    break
                case 'docx':
                    content = exportAsDOCX(segments)
                    break
                case 'pdf':
                    const pdfDoc = await exportAsPDF(segments)
                    pdfDoc.save(filename)
                    setIsExporting(false)
                    return
                default:
                    throw new Error(`Unsupported format: ${format}`)
            }

            // Create and download file
            const blob = new Blob([content], { type: getMimeType(format) })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            // Call the onExport callback if provided
            if (onExport) {
                onExport(format, filename)
            }

            // Show success message
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)

        } catch (error) {
            console.error('Export error:', error)
            alert(`Failed to export as ${format.toUpperCase()}: ${error.message}`)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleDropdownToggle}
                disabled={isExporting}
                className="bg-white hover:text-red-500 duration-200 text-red-300 px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                title="Export in different formats"
                data-export-button
            >
                <i className="fa-solid fa-download"></i>
                <span className="hidden sm:inline">Export</span>
                <i className={`fa-solid fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Success message */}
            {showSuccess && (
                <div className={`absolute -top-12 ${
                    dropdownPosition === 'right' ? 'right-0' : 
                    dropdownPosition === 'left' ? 'left-0' : 
                    'left-1/2 transform -translate-x-1/2'
                } bg-green-500 text-white px-3 py-2 rounded text-sm whitespace-nowrap animate-pulse`}>
                    <i className="fa-solid fa-check mr-2"></i>
                    Export successful!
                </div>
            )}

            {isOpen && (
                <div className={`absolute ${
                    dropdownPosition === 'right' ? 'right-0' : 
                    dropdownPosition === 'left' ? 'left-0' : 
                    'left-1/2 transform -translate-x-1/2'
                } ${document.body.classList.contains('dropdown-above') ? 'bottom-full mb-2' : 'top-full mt-2'} w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto`}>
                    <div className="py-2">
                        {exportFormats.map((format) => (
                                                            <button
                                    key={format.key}
                                    onClick={() => handleExport(format.key)}
                                    disabled={isExporting || (format.isRevAI && !jobId)}
                                    className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-left hover:bg-gray-100 active:bg-gray-200 flex items-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed group touch-manipulation ${
                                        format.isRevAI && !jobId ? 'opacity-50' : ''
                                    }`}
                                    title={format.isRevAI && !jobId ? 'Complete a transcription first to access Rev AI native captions' : format.description}
                                >
                                <i className={`fa-solid ${format.icon} text-gray-600 w-4 flex-shrink-0`}></i>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {format.label}
                                        {format.isRevAI && <span className="ml-1 text-xs text-blue-600">(Rev AI)</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 group-hover:text-gray-700 hidden sm:block">{format.description}</div>
                                </div>
                                {isExporting && (
                                    <i className="fa-solid fa-spinner animate-spin ml-auto flex-shrink-0"></i>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown when clicking outside */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                    onTouchStart={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    )
}
