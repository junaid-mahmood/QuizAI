import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Share2, Download, Printer, Info, Clock, Tag, Book, Settings, Star, AlertCircle, CheckCircle, Copy } from 'lucide-react'
import './QuizPreview.css'

export default function QuizPreview() {
  const location = useLocation()
  const navigate = useNavigate()
  const quiz = location.state?.quiz
  const [showInfo, setShowInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [timeLimit, setTimeLimit] = useState(quiz?.questions.length * 2 || 10)
  const [difficulty, setDifficulty] = useState('medium')
  const [showCopyConfirm, setShowCopyConfirm] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])

  useEffect(() => {
    // Reset copy confirmation after 2 seconds
    if (showCopyConfirm) {
      const timer = setTimeout(() => setShowCopyConfirm(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showCopyConfirm])

  if (!quiz) {
    navigate('/')
    return null
  }

  const calculateDifficulty = () => {
    const avgOptionsLength = quiz.questions.reduce((acc, q) => 
      acc + q.options.length, 0) / quiz.questions.length
    return avgOptionsLength > 4 ? 'hard' : avgOptionsLength > 3 ? 'medium' : 'easy'
  }

  const getDifficultyColor = () => {
    const difficulties = {
      easy: 'green',
      medium: 'orange',
      hard: 'red'
    }
    return difficulties[difficulty]
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: quiz.title,
          text: `Check out this quiz: ${quiz.title}`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShowCopyConfirm(true)
      }
    } catch (error) {
      console.error('Error sharing quiz:', error)
    }
  }

  const handleDownload = () => {
    const quizData = JSON.stringify({
      ...quiz,
      metadata: {
        timeLimit,
        difficulty,
        tags: selectedTags,
        exportDate: new Date().toISOString()
      }
    }, null, 2)
    const blob = new Blob([quizData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDuplicate = () => {
    const duplicatedQuiz = {
      ...quiz,
      title: `${quiz.title} (Copy)`,
      id: Date.now()
    }
    navigate('/create', { state: { quiz: duplicatedQuiz } })
  }

  const getProgressStats = () => {
    const totalQuestions = quiz.questions.length
    const completedQuestions = quiz.questions.filter(q => q.correctAnswer).length
    return {
      total: totalQuestions,
      completed: completedQuestions,
      percentage: Math.round((completedQuestions / totalQuestions) * 100)
    }
  }

  const stats = getProgressStats()

  return (
    <div className="quiz-preview">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="preview-content"
      >
        <div className="quiz-header">
          <div className="title-section">
            <h1>{quiz.title}</h1>
            <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor() }}>
              {difficulty}
            </div>
          </div>
          
          <div className="quiz-meta">
            <span><Book size={16} /> {quiz.questions.length} Questions</span>
            <span>•</span>
            <span><Clock size={16} /> {timeLimit} mins</span>
            {selectedTags.map(tag => (
              <span key={tag} className="tag">
                <Tag size={14} /> {tag}
              </span>
            ))}
          </div>

          <div className="header-actions">
            <button 
              className="info-button"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info size={20} />
            </button>
            <button 
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="quiz-info"
            >
              <p><strong>Created:</strong> Today</p>
              <p><strong>Description:</strong> {quiz.description || 'No description provided'}</p>
              <p><strong>Total Points:</strong> {quiz.questions.length * 10}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${stats.percentage}%` }}
                />
                <span>{stats.percentage}% Complete</span>
              </div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="quiz-settings"
            >
              <div className="setting-group">
                <label>Time Limit (minutes)</label>
                <input 
                  type="number" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              
              <div className="setting-group">
                <label>Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input 
                    type="text"
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        setSelectedTags([...selectedTags, e.target.value])
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="questions-list">
          {quiz.questions.map((question, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="question-card"
            >
              <div className="question-header">
                <h3>Question {index + 1}</h3>
                <div className="question-meta">
                  <span className="points">
                    <Star size={16} /> 10 points
                  </span>
                  {question.type && (
                    <span className="question-type">
                      {question.type}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="question-text">{question.question}</p>
              
              {question.image && (
                <img 
                  src={question.image} 
                  alt="Question visual"
                  className="question-image" 
                />
              )}
              
              <div className="options-list">
                {question.options.map((option, optIndex) => (
                  <motion.button
                    key={optIndex}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`option-button ${option === question.correctAnswer ? 'correct' : ''}`}
                  >
                    <span className="option-label">
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    {option}
                    {option === question.correctAnswer && (
                      <CheckCircle size={16} className="correct-icon" />
                    )}
                  </motion.button>
                ))}
              </div>

              {question.explanation && (
                <div className="explanation">
                  <AlertCircle size={16} />
                  <p>{question.explanation}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="preview-actions">
          <div className="action-buttons">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-button"
              onClick={handleShare}
              title="Share Quiz"
            >
              {showCopyConfirm ? <CheckCircle size={20} /> : <Share2 size={20} />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-button"
              onClick={handleDownload}
              title="Download Quiz"
            >
              <Download size={20} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-button"
              onClick={handlePrint}
              title="Print Quiz"
            >
              <Printer size={20} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-button"
              onClick={handleDuplicate}
              title="Duplicate Quiz"
            >
              <Copy size={20} />
            </motion.button>
          </div>
          
          <div className="main-actions">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="edit-button"
              onClick={() => navigate(-1)}
            >
              Edit Quiz
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="take-quiz-button"
              onClick={() => navigate('/take-quiz', { 
                state: { 
                  quiz,
                  settings: {
                    timeLimit,
                    difficulty,
                    tags: selectedTags
                  }
                } 
              })}
            >
              Take Quiz
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
 } 