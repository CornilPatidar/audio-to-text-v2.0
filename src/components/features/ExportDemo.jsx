import React from 'react'
import ExportOptions from './ExportOptions'

// Sample transcription data for demo
const sampleTranscription = [
    {
        index: 0,
        text: "Welcome to AudioTextly, the professional audio transcription service.",
        start: 0,
        end: 4.2,
        speaker: 0
    },
    {
        index: 1,
        text: "This is a demonstration of our multi-format export capabilities.",
        start: 4.2,
        end: 8.1,
        speaker: 0
    },
    {
        index: 2,
        text: "You can export your transcriptions in TXT, PDF, DOCX, JSON, SRT, and VTT formats.",
        start: 8.1,
        end: 12.5,
        speaker: 0
    },
    {
        index: 3,
        text: "Each format serves different purposes and use cases.",
        start: 12.5,
        end: 15.8,
        speaker: 0
    }
]

export default function ExportDemo() {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Functionality Demo</h2>
            <p className="text-gray-600 mb-6">
                This demo shows the transcription export functionality. Try exporting the sample transcription below in different formats.
            </p>
            
            <div className="bg-white p-4 rounded border mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Sample Transcription:</h3>
                <div className="text-sm text-gray-700 space-y-2">
                    {sampleTranscription.map((segment, index) => (
                        <div key={index} className="flex gap-2">
                            <span className="text-gray-500 text-xs w-16">
                                {Math.floor(segment.start)}s - {Math.floor(segment.end)}s
                            </span>
                            <span>{segment.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-center">
                <ExportOptions 
                    segments={sampleTranscription}
                    onExport={(format, filename) => {
                        console.log(`Demo export: ${format} -> ${filename}`)
                    }}
                />
            </div>
            
            <div className="mt-6 text-xs text-gray-500 text-center">
                <p>Click the Export button above to test different export formats</p>
            </div>
        </div>
    )
}
