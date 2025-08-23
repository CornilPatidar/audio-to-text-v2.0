import logo from "../assets/logo.png"
import { useAuth } from "../contexts/AuthContext"
import UserProfile from "./UserProfile"
import LoginButton from "./LoginButton"

export default function Header() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <img className="w-8 sm:w-10" src={logo}/>
        <a href="/"><h1 className="font-semibold text-sm sm:text-base">Audio<span className="text-red-400 bold">Textly</span></h1></a>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <a href="/" className='flex items-center gap-1 sm:gap-2 specialBtn px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-red-400 hover:text-red-500 transition-all duration-200 hover:-translate-y-0.5 text-xs sm:text-sm'>
          <p>New</p>
          <i className="fa-solid fa-plus text-xs sm:text-sm"></i>
        </a>
        {isAuthenticated ? <UserProfile /> : <LoginButton />}
      </div>
    </header>
  )
}
