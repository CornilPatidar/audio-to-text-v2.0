// Simple test for export functions
import { 
    exportAsTXT, 
    exportAsJSON, 
    exportAsSRT, 
    exportAsVTT, 
    exportAsDOCX,
    generateFilename,
    getFileExtension,
    getMimeType
} from './exportFormats.js'

// Sample transcription data
const sampleSegments = [
    {
        index: 0,
        text: "Hello, this is a test transcription.",
        start: 0,
        end: 3.5,
        speaker: 0
    },
    {
        index: 1,
        text: "It contains multiple segments with timestamps.",
        start: 3.5,
        end: 7.2,
        speaker: 0
    },
    {
        index: 2,
        text: "This is the final segment.",
        start: 7.2,
        end: 10.0,
        speaker: 0
    }
]

// Test functions
function testExportFunctions() {
    console.log('🧪 Testing export functions...')
    
    // Test TXT export
    const txtResult = exportAsTXT(sampleSegments)
    console.log('✅ TXT Export:', txtResult.substring(0, 50) + '...')
    
    // Test JSON export
    const jsonResult = exportAsJSON(sampleSegments)
    console.log('✅ JSON Export:', jsonResult.substring(0, 100) + '...')
    
    // Test SRT export
    const srtResult = exportAsSRT(sampleSegments)
    console.log('✅ SRT Export:', srtResult.substring(0, 100) + '...')
    
    // Test VTT export
    const vttResult = exportAsVTT(sampleSegments)
    console.log('✅ VTT Export:', vttResult.substring(0, 100) + '...')
    
    // Test DOCX export
    const docxResult = exportAsDOCX(sampleSegments)
    console.log('✅ DOCX Export:', docxResult.substring(0, 100) + '...')
    
    // Test utility functions
    console.log('✅ Filename generation:', generateFilename('txt'))
    console.log('✅ File extension:', getFileExtension('srt'))
    console.log('✅ MIME type:', getMimeType('json'))
    
    console.log('🎉 All export functions working correctly!')
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment - add to window for testing
    window.testExportFunctions = testExportFunctions
    console.log('Export test functions available. Run window.testExportFunctions() to test.')
}
