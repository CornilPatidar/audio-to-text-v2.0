// Export format utilities for transcription results

/**
 * Convert transcription segments to plain text
 */
export function exportAsTXT(segments) {
    return segments.map(segment => segment.text).join(' ')
}

/**
 * Convert transcription segments to JSON format
 */
export function exportAsJSON(segments) {
    return JSON.stringify({
        transcription: segments,
        metadata: {
            totalSegments: segments.length,
            exportDate: new Date().toISOString(),
            format: 'json'
        }
    }, null, 2)
}

/**
 * Convert transcription segments to SRT (SubRip) format
 */
export function exportAsSRT(segments) {
    return segments.map((segment, index) => {
        const startTime = formatTime(segment.start)
        const endTime = formatTime(segment.end)
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`
    }).join('\n')
}

/**
 * Convert transcription segments to VTT (WebVTT) format
 */
export function exportAsVTT(segments) {
    const header = 'WEBVTT\n\n'
    const cues = segments.map((segment, index) => {
        const startTime = formatTimeVTT(segment.start)
        const endTime = formatTimeVTT(segment.end)
        return `${startTime} --> ${endTime}\n${segment.text}`
    }).join('\n\n')
    
    return header + cues
}

/**
 * Convert transcription segments to DOCX format using a simple HTML approach
 * Note: This creates an HTML file that can be opened in Word
 */
export function exportAsDOCX(segments) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Transcription</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .segment { margin-bottom: 20px; }
        .timestamp { color: #666; font-size: 12px; }
        .text { font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>Audio Transcription</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total segments:</strong> ${segments.length}</p>
    <hr>
    ${segments.map((segment, index) => `
        <div class="segment">
            <div class="timestamp">Segment ${index + 1}: ${formatTime(segment.start)} - ${formatTime(segment.end)}</div>
            <div class="text">${segment.text}</div>
        </div>
    `).join('')}
</body>
</html>`
    
    return htmlContent
}

/**
 * Convert transcription segments to PDF format using jsPDF
 */
export function exportAsPDF(segments) {
    // Import jsPDF dynamically to avoid SSR issues
    return import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF()
        
        // Set up document
        doc.setFont('helvetica')
        doc.setFontSize(16)
        doc.text('Audio Transcription', 20, 20)
        
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
        doc.text(`Total segments: ${segments.length}`, 20, 37)
        
        // Add separator line
        doc.line(20, 45, 190, 45)
        
        let yPosition = 55
        const pageHeight = 280
        const lineHeight = 8
        
        segments.forEach((segment, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight) {
                doc.addPage()
                yPosition = 20
            }
            
            // Format timestamp
            const startTime = formatTime(segment.start)
            const endTime = formatTime(segment.end)
            
            // Add segment number and timestamp
            doc.setFontSize(8)
            doc.setTextColor(100, 100, 100)
            doc.text(`Segment ${index + 1}: ${startTime} - ${endTime}`, 20, yPosition)
            yPosition += 5
            
            // Add text content
            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            
            // Split text into lines if it's too long
            const maxWidth = 170
            const words = segment.text.split(' ')
            let line = ''
            
            for (let word of words) {
                const testLine = line + word + ' '
                const testWidth = doc.getTextWidth(testLine)
                
                if (testWidth > maxWidth && line !== '') {
                    doc.text(line, 20, yPosition)
                    yPosition += lineHeight
                    line = word + ' '
                    
                    // Check if we need a new page
                    if (yPosition > pageHeight) {
                        doc.addPage()
                        yPosition = 20
                    }
                } else {
                    line = testLine
                }
            }
            
            // Add the last line
            if (line) {
                doc.text(line, 20, yPosition)
                yPosition += lineHeight
            }
            
            yPosition += 5 // Add space between segments
        })
        
        return doc
    })
}

/**
 * Format time in SRT format (HH:MM:SS,mmm)
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/**
 * Format time in VTT format (HH:MM:SS.mmm)
 */
function formatTimeVTT(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

/**
 * Get file extension for each format
 */
export function getFileExtension(format) {
    const extensions = {
        txt: 'txt',
        json: 'json',
        srt: 'srt',
        vtt: 'vtt',
        revai_srt: 'srt',
        revai_vtt: 'vtt',
        docx: 'html', // We're creating HTML that can be opened in Word
        pdf: 'pdf'
    }
    return extensions[format] || 'txt'
}

/**
 * Get MIME type for each format
 */
export function getMimeType(format) {
    const mimeTypes = {
        txt: 'text/plain',
        json: 'application/json',
        srt: 'text/plain',
        vtt: 'text/plain',
        revai_srt: 'text/plain',
        revai_vtt: 'text/plain',
        docx: 'text/html',
        pdf: 'application/pdf'
    }
    return mimeTypes[format] || 'text/plain'
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format, prefix = 'AudioTextly') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const extension = getFileExtension(format)
    return `${prefix}_${timestamp}.${extension}`
}
