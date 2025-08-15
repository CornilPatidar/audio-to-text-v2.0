// Import the application logo image
import logo from "../assets/logo.png"

/**
 * Header Component - Application navigation header
 * 
 * This component renders the top navigation bar with the application logo,
 * title, and a "New" button to start a new transcription session.
 */
export default function Header() {
  return (
    // Main header container with flexbox layout for proper spacing
    <header className="flex items-center justify-between gap-4 p-4">
          {/* Left side: Logo and application title */}
          <div className="flex items-center gap-2">
          {/* Application logo image */}
          <img className="w-10" src={logo} alt="AudioBridge logo"/>
          {/* Application title with brand styling - clicking returns to home */}
          <a href="/"><h1 className="font-semibold">Audio<span className="text-blue-400 bold ">Bridge</span></h1></a>
          </div>
          
          {/* Right side: New session button */}
          {/* Navigation link to start a new transcription session */}
          <a href="/" className='flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-blue-400'>
                    <p>New</p>
                    {/* Font Awesome plus icon */}
                    <i className="fa-solid fa-plus"></i>
                </a>
        </header>
  )
}
