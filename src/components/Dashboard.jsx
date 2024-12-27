import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Dashboard.css'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-quizzes')
  const [bookmarkedQuizzes, setBookmarkedQuizzes] = useState([])
  const [myQuizzes, setMyQuizzes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [isLoading, setIsLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = () => {
    setIsLoading(true)
    try {
      const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '{"created":[], "attempted":[]}')
      
      const allQuizzes = [
        ...savedQuizzes.created.map(quiz => ({
          ...quiz,
          type: 'created',
          attempts: 0,
          score: 0
        })),
        ...savedQuizzes.attempted.map(quiz => ({
          ...quiz,
          type: 'attempted',
          attempts: 1,
          score: quiz.score || 0
        }))
      ]

      // Get unique quizzes by title, preferring the most recent attempt
      const uniqueQuizzes = allQuizzes.reduce((acc, current) => {
        const existing = acc.find(item => item.title === current.title)
        if (!existing) {
          acc.push(current)
        } else if (new Date(current.completedAt || current.createdAt) > new Date(existing.completedAt || existing.createdAt)) {
          acc[acc.indexOf(existing)] = current
        }
        return acc
      }, [])

      setMyQuizzes(uniqueQuizzes)
      setBookmarkedQuizzes(uniqueQuizzes.filter(quiz => quiz.isBookmarked))
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = (quizId) => {
    const updatedQuizzes = myQuizzes.map(quiz =>
      quiz.id === quizId ? { ...quiz, isBookmarked: !quiz.isBookmarked } : quiz
    )
    setMyQuizzes(updatedQuizzes)
    
    // Update localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '{"created":[], "attempted":[]}')
    savedQuizzes.created = savedQuizzes.created.map(quiz =>
      quiz.id === quizId ? { ...quiz, isBookmarked: !quiz.isBookmarked } : quiz
    )
    savedQuizzes.attempted = savedQuizzes.attempted.map(quiz =>
      quiz.id === quizId ? { ...quiz, isBookmarked: !quiz.isBookmarked } : quiz
    )
    localStorage.setItem('quizzes', JSON.stringify(savedQuizzes))
    
    // Update bookmarked quizzes
    setBookmarkedQuizzes(updatedQuizzes.filter(quiz => quiz.isBookmarked))
  }

  const handleShare = (quiz) => {
    setSelectedQuiz(quiz)
    setShowShareModal(true)
  }

  const handleEdit = (quizId) => {
    const quiz = myQuizzes.find(q => q.id === quizId)
    if (quiz) {
      navigate('/create', { 
        state: { 
          quiz: {
            ...quiz,
            type: quiz.type || 'multiple-choice',
            difficulty: quiz.difficulty || 'medium',
            questions: quiz.questions.map(q => ({
              ...q,
              type: q.type || 'multiple-choice'
            }))
          }
        } 
      })
    }
  }

  const handleDelete = (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      // Remove from state
      const updatedQuizzes = myQuizzes.filter(quiz => quiz.id !== quizId)
      setMyQuizzes(updatedQuizzes)
      setBookmarkedQuizzes(updatedQuizzes.filter(quiz => quiz.isBookmarked))
      
      // Remove from localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '{"created":[], "attempted":[]}')
      savedQuizzes.created = savedQuizzes.created.filter(quiz => quiz.id !== quizId)
      savedQuizzes.attempted = savedQuizzes.attempted.filter(quiz => quiz.id !== quizId)
      localStorage.setItem('quizzes', JSON.stringify(savedQuizzes))
    }
  }

  const filteredQuizzes = (quizzes) => {
    return quizzes
      .filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'date':
            return new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
          case 'attempts':
            return b.attempts - a.attempts
          default:
            return 0
        }
      })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-controls">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="attempts">Sort by Attempts</option>
          </select>
        </div>
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'my-quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-quizzes')}
          >
            My Quizzes
          </button>
          <button 
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks
          </button>
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="dashboard-content"
        >
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
              {activeTab === 'my-quizzes' && (
                <div className="quizzes-grid">
                  {filteredQuizzes(myQuizzes).map(quiz => (
                    <QuizCard 
                      key={quiz.id} 
                      quiz={quiz}
                      onBookmark={handleBookmark}
                      onShare={() => handleShare(quiz)}
                      onEdit={() => handleEdit(quiz.id)}
                      onDelete={() => handleDelete(quiz.id)}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="quizzes-grid">
                  {filteredQuizzes(bookmarkedQuizzes).map(quiz => (
                    <QuizCard 
                      key={quiz.id} 
                      quiz={quiz}
                      onBookmark={handleBookmark}
                      onShare={() => handleShare(quiz)}
                      onEdit={() => handleEdit(quiz.id)}
                      onDelete={() => handleDelete(quiz.id)}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="stats-container">
                  <div className="stats-card">
                    <h3>Total Quizzes</h3>
                    <p className="stat-value">{myQuizzes.length}</p>
                  </div>
                  <div className="stats-card">
                    <h3>Total Attempts</h3>
                    <p className="stat-value">
                      {myQuizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
                    </p>
                  </div>
                  <div className="stats-card">
                    <h3>Average Score</h3>
                    <p className="stat-value">
                      {Math.round(
                        myQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / myQuizzes.length
                      )}%
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <h2>Share Quiz</h2>
            <p>Share "{selectedQuiz?.title}" with others:</p>
            <div className="share-options">
              <button className="share-option">
                <i className="fas fa-link"></i>
                Copy Link
              </button>
              <button className="share-option">
                <i className="fab fa-twitter"></i>
                Twitter
              </button>
              <button className="share-option">
                <i className="fab fa-facebook"></i>
                Facebook
              </button>
            </div>
            <button 
              className="close-modal"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz, onBookmark, onShare, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate('/create', { 
      state: { 
        quiz: {
          ...quiz,
          type: quiz.type || 'multiple-choice',
          difficulty: quiz.difficulty || 'medium',
          questions: quiz.questions.map(q => ({
            ...q,
            type: q.type || 'multiple-choice'
          }))
        }
      } 
    })
  }

  return (
    <motion.div 
      className="quiz-card"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="quiz-header">
        <h3>{quiz.title}</h3>
        <div className="quiz-actions">
          <button 
            className={`bookmark-btn ${quiz.isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmark(quiz.id)}
          >
            {quiz.isBookmarked ? '★' : '☆'}
          </button>
          <button 
            className="share-btn"
            onClick={onShare}
          >
            Share
          </button>
          <button 
            className="edit-btn"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(quiz.id)}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="quiz-details">
        <p>{quiz.description}</p>
        <div className="quiz-stats">
          <span>Questions: {quiz.questionCount}</span>
          <span>Attempts: {quiz.attempts}</span>
          <span>Created: {new Date(quiz.dateCreated).toLocaleDateString()}</span>
        </div>
        <div className="quiz-score">
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ width: `${quiz.score}%` }}
            />
          </div>
          <span className="score-text">{quiz.score}% Success Rate</span>
        </div>
      </div>
    </motion.div>
  )
} 