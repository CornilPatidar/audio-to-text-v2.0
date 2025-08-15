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
    <header className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
          <img className="w-10" src={logo} alt="AudioBridge logo"/>
          <a href="/"><h1 className="font-semibold">Audio<span className="text-blue-400 bold ">Bridge</span></h1></a>
          </div>
          
          {/* Navigation link to start a new transcription session */}
          <a href="/" className='flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-blue-400'>
                    <p>New</p>
                    {/* Font Awesome plus icon */}
                    <i className="fa-solid fa-plus"></i>
                </a>
        </header>
  )
}
