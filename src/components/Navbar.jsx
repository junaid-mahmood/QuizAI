import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  // Add listener for auth changes
  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('currentUser'))
      setCurrentUser(user)
    }

    // Check initial auth state
    checkAuth()

    // Listen for storage changes
    window.addEventListener('storage', checkAuth)
    // Custom event for auth changes
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setShowUserMenu(false)
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          QuizAI
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">My Quizzes</Link>
          
          {currentUser ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <span className="username">{currentUser.username}</span>
                  <span className="email">{currentUser.email}</span>
                </div>
              </button>
              
              {showUserMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="user-dropdown"
                >
                  <button onClick={handleLogout}>Logout</button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="auth-link">Sign Up</Link>
          )}
        </div>
      </div>
    </nav>
  )
} 