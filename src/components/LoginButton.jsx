import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginButton() {
  const { loginWithGoogle, loginWithGithub, loading, error, clearError } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState('right')
  const buttonRef = useRef(null)

  const handleGoogleLogin = async () => {
    clearError()
    setShowDropdown(false)
    await loginWithGoogle()
  }

  const handleGithubLogin = async () => {
    clearError()
    setShowDropdown(false)
    await loginWithGithub()
  }

  const handleDropdownToggle = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      // Check horizontal positioning
      if (rect.right + 224 > windowWidth) { // 224px = w-56 (14rem)
        setDropdownPosition('left')
      } else if (rect.left - 224 < 0) {
        setDropdownPosition('center')
      } else {
        setDropdownPosition('right')
      }
      
      // Check vertical positioning
      if (rect.bottom + 200 > windowHeight) { // Approximate dropdown height
        document.body.classList.add('dropdown-above')
      } else {
        document.body.classList.remove('dropdown-above')
      }
    }
    
    setShowDropdown(!showDropdown)
  }

  useEffect(() => {
    const handleResize = () => {
      if (showDropdown) {
        setShowDropdown(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.classList.remove('dropdown-above')
    }
  }, [showDropdown])

  return (
    <div className="relative flex items-center gap-2">
                                                                                                               <button
            onClick={handleDropdownToggle}
            className="flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-red-400 hover:text-red-500 transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-sign-in-alt text-sm"></i>
            <span className="text-sm font-medium">Log In</span>
          </button>
        
                                                                                                                                                                                                                                                                 <button
               ref={buttonRef}
               onClick={handleDropdownToggle}
               className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 transition-all duration-200 px-3 py-2 rounded-lg shadow-lg shadow-red-500/50 hover:-translate-y-0.5"
             >
               <i className="fa-solid fa-user-plus text-sm"></i>
               <span className="text-sm font-medium">Sign Up</span>
             </button>

      {showDropdown && (
        <>
                     <div className={`absolute ${dropdownPosition === 'right' ? 'right-0' : dropdownPosition === 'left' ? 'left-0' : 'left-1/2 transform -translate-x-1/2'} ${document.body.classList.contains('dropdown-above') ? 'bottom-full mb-2' : 'top-full mt-2'} w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
            <div className="p-3">
                             {error && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-3">
                   {error}
                   {error.includes('cancelled') && (
                     <div className="mt-2 text-xs text-gray-600">
                       💡 Tip: Make sure to complete the sign-in process in the popup window
                     </div>
                   )}
                 </div>
               )}
              
              <div className="space-y-2">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-brands fa-google text-red-500"></i>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <button
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-brands fa-github"></i>
                  {loading ? 'Signing in...' : 'Continue with GitHub'}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Log in or sign up to save your transcriptions
                </p>
              </div>
            </div>
          </div>

                     {/* Backdrop */}
           <div
             className="fixed inset-0 z-40"
             onClick={() => setShowDropdown(false)}
             onTouchStart={() => setShowDropdown(false)}
           ></div>
        </>
      )}
    </div>
  )
}
