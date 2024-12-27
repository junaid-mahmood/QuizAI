import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const navigate = useNavigate()

  const quickStartOptions = [
    "JavaScript Programming Quiz",
    "Python Basics Quiz",
    "World History Short Answer",
    "Mathematics Problem Solving",
    "Literature Analysis",
    "Science & Technology MCQ"
  ]

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    console.log('Input value:', e.target.value)
  }

  const handleCreateQuiz = async () => {
    if (!inputValue.trim()) return
    
    navigate('/create', { 
      state: { 
        topic: inputValue,
        type: inputValue.toLowerCase().includes('short answer') ? 'short-answer' : 'multiple-choice',
        difficulty: 'medium',
        generateImmediately: true
      } 
    })
  }

  return (
    <div className="home">
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-text"
        >
          <h1>Create Any Quiz You Want</h1>
          <p>Type a topic below and let AI generate your quiz instantly</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="input-container"
        >
          <div className="input-box">
            <div className="animated-border"></div>
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCreateQuiz()
                }
              }}
              placeholder="Type any topic for your quiz (e.g., 'Create a quiz about Renaissance Art' or 'Make a quiz about Space Exploration')"
              className="main-input"
              spellCheck="false"
              autoComplete="off"
            />
            <div className="input-actions">
              <button 
                className="create-button"
                onClick={handleCreateQuiz}
                disabled={!inputValue.trim()}
              >
                Generate Quiz Now →
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="quick-start"
        >
          <h2>Or Choose a Template</h2>
          <div className="quick-start-grid">
            {quickStartOptions.map((option, index) => (
              <motion.button 
                key={index} 
                className="option-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate('/create', { 
                    state: { 
                      topic: option,
                      type: option.toLowerCase().includes('short answer') ? 'short-answer' : 'multiple-choice',
                      difficulty: 'medium',
                      generateImmediately: true
                    } 
                  })
                }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
} 