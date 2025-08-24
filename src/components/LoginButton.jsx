import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginButton() {
  const { loginWithGoogle, loginWithGithub, login, register, loading, error, clearError } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState('right')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  })
  const [validationErrors, setValidationErrors] = useState({})
  const buttonRef = useRef(null)

  const handleGoogleLogin = async (e) => {
    e?.preventDefault()
    clearError()
    setShowDropdown(false)
    await loginWithGoogle()
  }

  const handleGithubLogin = async (e) => {
    e?.preventDefault()
    clearError()
    setShowDropdown(false)
    await loginWithGithub()
  }

  const handleInputChange = (e) => {
    console.log('Input change event:', e.target.name, e.target.value)
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (isRegistering) {
      if (!formData.username.trim()) {
        errors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      }

      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }

      if (!formData.name.trim()) {
        errors.name = 'Name is required'
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }

      if (!formData.acceptTerms) {
        errors.acceptTerms = 'You must accept the terms and conditions'
      }
    } else {
      if (!formData.username.trim()) {
        errors.username = 'Username or email is required'
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    if (isRegistering) {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(), // Convert email to lowercase
        password: formData.password,
        name: formData.name.trim()
      }
      const result = await register(userData)
             if (result.success) {
         setShowDropdown(false)
         setShowCustomForm(false)
         setIsRegistering(false)
         setFormData({ username: '', email: '', password: '', confirmPassword: '', name: '', acceptTerms: false })
       }
    } else {
      // Convert to lowercase if it looks like an email, otherwise keep as-is
      const identifier = formData.username.trim()
      const isEmail = identifier.includes('@')
      const processedIdentifier = isEmail ? identifier.toLowerCase() : identifier
      
      const credentials = {
        username: processedIdentifier,
        password: formData.password
      }
             const result = await login(credentials)
       if (result.success) {
         setShowDropdown(false)
         setShowCustomForm(false)
         setFormData({ username: '', email: '', password: '', confirmPassword: '', name: '', acceptTerms: false })
       }
    }
  }

  const handleDropdownToggle = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      // Force center positioning on mobile and ensure it fits
      const isMobile = windowWidth < 640
      
      if (isMobile) {
        setDropdownPosition('center')
        // On mobile, always position at top center
        document.body.classList.remove('dropdown-above')
      } else {
        // Desktop logic - updated to use 280px width
        const dropdownWidth = 280
        const margin = 16
        if (rect.right + dropdownWidth > windowWidth - margin) {
          setDropdownPosition('left')
        } else if (rect.left - dropdownWidth < margin) {
          setDropdownPosition('center')
        } else {
          setDropdownPosition('right')
        }
        
        // Check vertical positioning for desktop only
        const dropdownHeight = 400
        if (rect.bottom + dropdownHeight > windowHeight - 8) {
          document.body.classList.add('dropdown-above')
        } else {
          document.body.classList.remove('dropdown-above')
        }
      }
    }
    
    setShowDropdown(!showDropdown)
  }

  useEffect(() => {
    // Temporarily disable resize handler to test if it's causing the issue
    // let resizeTimeout;
    // const handleResize = () => {
    //   // Clear any existing timeout
    //   clearTimeout(resizeTimeout);
    //   
    //   // Set a timeout to only close dropdown after a delay
    //   // This prevents closing on virtual keyboard appearance
    //   resizeTimeout = setTimeout(() => {
    //     if (showDropdown) {
    //       setShowDropdown(false)
    //     }
    //   }, 300); // 300ms delay
    // }

    // window.addEventListener('resize', handleResize)
    return () => {
      // window.removeEventListener('resize', handleResize)
      // clearTimeout(resizeTimeout)
      document.body.classList.remove('dropdown-above')
    }
  }, [showDropdown])

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={handleDropdownToggle}
        className="flex items-center gap-1 sm:gap-2 specialBtn px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-red-400 hover:text-red-500 transition-all duration-200 hover:-translate-y-0.5 text-xs sm:text-sm"
      >
        <i className="fa-solid fa-sign-in-alt text-xs sm:text-sm"></i>
        <span className="text-xs sm:text-sm font-medium">Log In</span>
      </button>

      {showDropdown && (
        <>
                                                                                                                                   <div 
            className={`${window.innerWidth < 640 ? 'fixed' : 'absolute'} ${window.innerWidth < 640 ? 'left-4 right-4' : 'right-0'} ${document.body.classList.contains('dropdown-above') ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden`} 
            style={{
              width: window.innerWidth < 640 ? 'auto' : '280px',
              top: window.innerWidth < 640 ? '80px' : undefined,
              maxWidth: window.innerWidth < 640 ? 'none' : '280px'
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div 
              className="p-2 sm:p-3 max-h-[60vh] sm:max-h-[80vh] overflow-y-auto"
              style={{
                position: 'relative',
                zIndex: 51
              }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
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
              
              {!showCustomForm ? (
                <>
                                                                           <div className="space-y-1.5 sm:space-y-2">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fa-brands fa-google text-red-500"></i>
                        {loading ? 'Signing in...' : 'Continue with Google'}
                      </button>

                      <button
                        type="button"
                        onClick={handleGithubLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fa-brands fa-github"></i>
                        {loading ? 'Signing in...' : 'Continue with GitHub'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomForm(true)
                          setIsRegistering(false)
                          clearError()
                        }}
                        aria-label="Sign in with email"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        <i className="fa-solid fa-envelope text-gray-500"></i>
                        Sign in with email
                      </button>
                    </div>

                   <div className="relative my-2 sm:my-3">
                     <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-gray-300" />
                     </div>
                     <div className="relative flex justify-center text-sm">
                       <span className="px-2 bg-white text-gray-500">Or</span>
                     </div>
                   </div>

                                       <div className="space-y-1.5 sm:space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomForm(true)
                          setIsRegistering(true)
                          clearError()
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        <i className="fa-solid fa-user-plus text-sm"></i>
                        Create new account
                      </button>
                    </div>

                   <div className="text-center">
                     <p className="text-xs text-gray-500">
                       Use your email and password.
                     </p>
                   </div>
                </>
              ) : (
                                 <form onSubmit={handleCustomSubmit} className="space-y-4 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {isRegistering ? 'Create Account' : 'Sign In'}
                    </h3>
                    <button
                      type="button"
                                             onClick={() => {
                         setShowCustomForm(false)
                         setIsRegistering(false)
                         setFormData({ username: '', email: '', password: '', confirmPassword: '', name: '', acceptTerms: false })
                         setValidationErrors({})
                         clearError()
                       }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>

                  {isRegistering && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                                                 className={`w-full px-3 py-2 sm:px-2 sm:py-1 text-sm border rounded ${
                           validationErrors.name ? 'border-red-300' : 'border-gray-300'
                         } focus:outline-none focus:ring-1 focus:ring-red-500`}
                        placeholder="Enter your full name"
                      />
                      {validationErrors.name && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
                      )}
                    </div>
                  )}

                                     {isRegistering && (
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">
                         Username
                       </label>
                       <input
                         name="username"
                         type="text"
                         required
                         value={formData.username}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 sm:px-2 sm:py-1 text-sm border rounded ${
                           validationErrors.username ? 'border-red-300' : 'border-gray-300'
                         } focus:outline-none focus:ring-1 focus:ring-red-500`}
                         placeholder="Choose a username"
                       />
                       {validationErrors.username && (
                         <p className="text-xs text-red-600 mt-1">{validationErrors.username}</p>
                       )}
                     </div>
                   )}

                   {isRegistering && (
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">
                         Email
                       </label>
                       <input
                         name="email"
                         type="email"
                         required
                         value={formData.email}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 sm:px-2 sm:py-1 text-sm border rounded ${
                           validationErrors.email ? 'border-red-300' : 'border-gray-300'
                         } focus:outline-none focus:ring-1 focus:ring-red-500`}
                         placeholder="Enter your email"
                       />
                       {validationErrors.email && (
                         <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                       )}
                     </div>
                   )}

                   {!isRegistering && (
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">
                         Username or Email
                       </label>
                       <input
                         name="username"
                         type="text"
                         required
                         value={formData.username}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 sm:px-2 sm:py-1 text-sm border rounded ${
                           validationErrors.username ? 'border-red-300' : 'border-gray-300'
                         } focus:outline-none focus:ring-1 focus:ring-red-500`}
                         placeholder="Enter username or email"
                       />
                       {validationErrors.username && (
                         <p className="text-xs text-red-600 mt-1">{validationErrors.username}</p>
                       )}
                     </div>
                   )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 sm:px-2 sm:py-1 pr-10 text-sm border rounded ${
                          validationErrors.password ? 'border-red-300' : 'border-gray-300'
                        } focus:outline-none focus:ring-1 focus:ring-red-500`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                                     {isRegistering && (
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">
                         Confirm Password
                       </label>
                       <div className="relative">
                         <input
                           name="confirmPassword"
                           type={showConfirmPassword ? "text" : "password"}
                           required
                           value={formData.confirmPassword}
                           onChange={handleInputChange}
                           className={`w-full px-3 py-2 sm:px-2 sm:py-1 pr-10 text-sm border rounded ${
                             validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                           } focus:outline-none focus:ring-1 focus:ring-red-500`}
                           placeholder="Confirm your password"
                         />
                         <button
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                         >
                           <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                         </button>
                       </div>
                       {validationErrors.confirmPassword && (
                         <p className="text-xs text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                       )}
                     </div>
                   )}

                   {isRegistering && (
                     <div className="flex items-start gap-2">
                       <input
                         type="checkbox"
                         name="acceptTerms"
                         id="acceptTerms"
                         checked={formData.acceptTerms}
                         onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                         className="mt-0.5 h-3 w-3 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                       />
                       <label htmlFor="acceptTerms" className="text-xs text-gray-700">
                         I agree to the{' '}
                         <a href="#" className="text-red-600 hover:text-red-500 underline">
                           Terms of Service
                         </a>{' '}
                         and{' '}
                         <a href="#" className="text-red-600 hover:text-red-500 underline">
                           Privacy Policy
                         </a>
                       </label>
                     </div>
                   )}
                   {isRegistering && validationErrors.acceptTerms && (
                     <
                      p className="text-xs text-red-600 mt-1">{validationErrors.acceptTerms}</p>
                   )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-500 border border-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50"
                  >
                    {loading ? (
                      <i className="fa-solid fa-spinner animate-spin"></i>
                    ) : (
                      <i className="fa-solid fa-sign-in-alt"></i>
                    )}
                    {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                                             onClick={() => {
                         setIsRegistering(!isRegistering)
                         setFormData({ username: '', email: '', password: '', confirmPassword: '', name: '', acceptTerms: false })
                         setValidationErrors({})
                         clearError()
                       }}
                      className="text-xs text-red-600 hover:text-red-500"
                    >
                      {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Backdrop - disabled for testing */}
          {/* {window.innerWidth >= 640 && (
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setShowDropdown(false)}
              onTouchStart={() => setShowDropdown(false)}
            ></div>
          )} */}
        </>
      )}
    </div>
  )
}
