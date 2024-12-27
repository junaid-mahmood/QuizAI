import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isLogin && !username.trim()) {
      setError('Username is required')
      return
    }

    try {
      if (isLogin) {
        // Handle Login
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find(u => u.email === email && u.password === password)
        
        if (!user) {
          setError('Invalid email or password')
          return
        }

        localStorage.setItem('currentUser', JSON.stringify(user))
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'))
      } else {
        // Handle Sign Up
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        if (users.some(u => u.email === email)) {
          setError('Email already exists')
          return
        }

        const newUser = {
          id: Date.now(),
          email,
          password,
          username,
          createdAt: new Date().toISOString()
        }

        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem('currentUser', JSON.stringify(newUser))
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'))
      }

      navigate('/dashboard')
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <h1>{isLogin ? 'Sign In' : 'Sign Up'}</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="auth-button"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  )
} 