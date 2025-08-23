// Test file for ExportOptions responsive positioning
// This can be run in the browser console to test the positioning logic

function testDropdownPositioning() {
    console.log('🧪 Testing dropdown positioning logic...')
    
    // Mock viewport dimensions
    const mockViewport = {
        width: 375, // iPhone SE width
        height: 667
    }
    
    // Mock button positions
    const buttonPositions = [
        { left: 10, right: 100, bottom: 600 }, // Near left edge
        { left: 200, right: 290, bottom: 600 }, // Near right edge  
        { left: 150, right: 240, bottom: 600 }, // Center
        { left: 300, right: 390, bottom: 600 }, // Off right edge
        { left: -50, right: 40, bottom: 600 }   // Off left edge
    ]
    
    buttonPositions.forEach((rect, index) => {
        const dropdownWidth = mockViewport.width < 640 ? 288 : 320
        const dropdownHeight = 240
        
        let position = 'right'
        
        // Check if dropdown would go off the right edge
        if (rect.right + dropdownWidth > mockViewport.width) {
            // Check if it would also go off the left edge
            if (rect.left - dropdownWidth < 0) {
                position = 'center'
            } else {
                position = 'left'
            }
        }
        
        // Check if dropdown would go below viewport
        const wouldGoBelow = rect.bottom + dropdownHeight > mockViewport.height
        
        console.log(`Button ${index + 1}: ${position}${wouldGoBelow ? ' (above)' : ''}`)
    })
    
    console.log('✅ Positioning logic test complete!')
}

// Export for browser testing
if (typeof window !== 'undefined') {
    window.testDropdownPositioning = testDropdownPositioning
    console.log('ExportOptions positioning test available. Run window.testDropdownPositioning() to test.')
}
