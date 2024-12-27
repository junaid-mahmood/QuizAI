import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './QuizTaking.css'

export default function QuizTaking() {
  const location = useLocation()
  const navigate = useNavigate()
  const quiz = location.state?.quiz

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  if (!quiz) {
    navigate('/')
    return null
  }

  const canSubmit = () => {
    return Object.keys(answers).length === quiz.questions.length
  }

  const handleAnswer = (option) => {
    if (isSubmitted) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: option
    }))
    
    if (currentQuestion < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1)
      }, 300)
    }
  }

  const calculateScore = () => {
    let correct = 0
    Object.keys(answers).forEach(questionIndex => {
      const question = quiz.questions[questionIndex]
      const userAnswer = answers[questionIndex]
      
      if (question.type === 'short-answer') {
        const keyWords = question.correctAnswer.toLowerCase().split(' ')
        const userWords = userAnswer.toLowerCase().split(' ')
        const hasKeyWords = keyWords.some(word => userWords.includes(word))
        if (hasKeyWords) correct++
      } else {
        if (userAnswer === question.correctAnswer) correct++
      }
    })
    return {
      score: Math.round((correct / quiz.questions.length) * 100),
      correct,
      total: quiz.questions.length
    }
  }

  const saveQuizToHistory = (quizData, score) => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '{"created":[], "attempted":[]}')
    
    const attemptedQuiz = {
      id: Date.now(),
      title: quizData.title,
      questions: quizData.questions,
      score: score.score,
      answers: answers,
      completedAt: new Date().toISOString()
    }

    savedQuizzes.attempted = [attemptedQuiz, ...savedQuizzes.attempted]
    localStorage.setItem('quizzes', JSON.stringify(savedQuizzes))
  }

  const handleSubmit = () => {
    if (!canSubmit()) {
      alert('Please answer all questions before submitting!')
      return
    }

    setIsSubmitted(true)
    const score = calculateScore()
    saveQuizToHistory(quiz, score)
    setTimeout(() => {
      setShowPopup(true)
    }, 1000)
  }

  const handleEdit = () => {
    navigate('/create', { state: { quiz } })
  }

  return (
    <div className="quiz-taking">
      {showPopup && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="popup-notification"
        >
          <p>Quiz saved! View all your quizzes and scores</p>
          <button onClick={() => navigate('/Dashboard')}>
            Go to My Quizzes
          </button>
          <button className="close-btn" onClick={() => setShowPopup(false)}>
            ×
          </button>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiz-content"
      >
        <h1>{quiz.title}</h1>
        
        {!isSubmitted ? (
          <>
            <div className="progress-bar">
              <div 
                className="progress"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            <div className="question-section">
              <h2>Question {currentQuestion + 1} of {quiz.questions.length}</h2>
              <p className="question-text">{quiz.questions[currentQuestion].question}</p>
              
              <div className="options-list">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${answers[currentQuestion] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="submit-section">
              {currentQuestion === quiz.questions.length - 1 && answers[currentQuestion] && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="submit-button ready"
                  onClick={handleSubmit}
                >
                  Submit Quiz
                </motion.button>
              )}

              {currentQuestion < quiz.questions.length - 1 && (
                <div className="question-counter">
                  {Object.keys(answers).length}/{quiz.questions.length} Questions Answered
                </div>
              )}
            </div>

            <div className="navigation-buttons">
              <button
                className="nav-button"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <button
                className="nav-button"
                onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                disabled={currentQuestion === quiz.questions.length - 1}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="results-section">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="score-card"
            >
              <div className="view-all-quizzes">
                <button onClick={() => navigate('/Dashboard')}>
                  View All My Quizzes
                </button>
              </div>

              <h2>Quiz Results</h2>
              <div className="score-circle">
                <span className="score-number">{calculateScore().score}%</span>
              </div>
              <p className="score-text">
                You got {calculateScore().correct} out of {calculateScore().total} questions correct
              </p>
            </motion.div>

            <div className="questions-review">
              {quiz.questions.map((question, index) => (
                <div 
                  key={index}
                  className="review-question"
                >
                  <h3>Question {index + 1}</h3>
                  <p>{question.question}</p>
                  <div className="review-options">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`review-option ${
                          option === question.correctAnswer ? 'correct' : ''
                        } ${option === answers[index] ? 'selected' : ''}`}
                      >
                        {option}
                        {option === question.correctAnswer && <span className="correct-label">✓ Correct</span>}
                        {option === answers[index] && option !== question.correctAnswer && 
                          <span className="incorrect-label">✗ Your Answer</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="result-actions">
              <button onClick={handleEdit} className="edit-button">
                Edit Quiz
              </button>
              <button onClick={() => navigate('/')} className="new-quiz-button">
                Create New Quiz
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 