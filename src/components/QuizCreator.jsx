import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_URL, API_KEY } from '../api/config'
import './QuizCreator.css'

export default function QuizCreator() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialTopic = location.state?.topic || ''
  const shouldGenerateImmediately = location.state?.generateImmediately

  const [quizParams, setQuizParams] = useState({
    topic: initialTopic,
    type: location.state?.type || 'multiple-choice',
    difficulty: location.state?.difficulty || 'medium'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location.state?.topic) {
      navigate('/')
      return
    }

    if (shouldGenerateImmediately) {
      handleGenerateQuiz()
    }
  }, [location.state, navigate])

  const generatePrompt = (params) => {
    if (params.type === 'short-answer') {
      return `Generate a ${params.difficulty} difficulty short answer quiz about ${params.topic}. 
      The quiz should have 5 questions.
      Format your response exactly as a JSON object with this structure:
      {
        "title": "Quiz Title Here",
        "questions": [
          {
            "type": "short-answer",
            "question": "Question text here",
            "correctAnswer": "Key points that should be in the answer"
          }
        ]
      }
      Make sure the response is valid JSON and includes exactly 5 questions.
      For each correct answer, include several key points or keywords that would indicate a correct response.`
    }

    return `Generate a ${params.difficulty} difficulty ${params.type} quiz about ${params.topic}. 
    The quiz should have 5 questions.
    Format your response exactly as a JSON object with this structure:
    {
      "title": "Quiz Title Here",
      "questions": [
        {
          "type": "multiple-choice",
          "question": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Correct option here"
        }
      ]
    }
    Make sure the response is valid JSON and includes exactly 5 questions.`
  }

  const saveCreatedQuiz = (quizContent) => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '{"created":[], "attempted":[]}')
    
    const createdQuiz = {
      id: Date.now(),
      title: quizContent.title,
      questions: quizContent.questions,
      type: quizParams.type,
      difficulty: quizParams.difficulty,
      createdAt: new Date().toISOString()
    }

    savedQuizzes.created = [createdQuiz, ...savedQuizzes.created]
    localStorage.setItem('quizzes', JSON.stringify(savedQuizzes))
  }

  const handleGenerateQuiz = async (e) => {
    e.preventDefault()
    if (!quizParams.topic.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: generatePrompt(quizParams)
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format')
      }

      const generatedText = data.candidates[0].content.parts[0].text
      console.log('Generated Text:', generatedText)

      try {
        const jsonString = generatedText.replace(/```json\n?|\n?```/g, '').trim()
        const quizContent = JSON.parse(jsonString)
        
        if (!quizContent.title || !Array.isArray(quizContent.questions)) {
          throw new Error('Invalid quiz format')
        }

        setGeneratedQuiz(quizContent)
        saveCreatedQuiz(quizContent)
        navigate('/take-quiz', { state: { quiz: quizContent } })
      } catch (parseError) {
        console.error('Error parsing quiz JSON:', parseError)
        setError('Failed to parse quiz response. Please try again.')
      }

    } catch (error) {
      console.error('Error generating quiz:', error)
      setError(`Failed to generate quiz: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTypeChange = (type) => {
    setQuizParams(prev => ({ ...prev, type }))
  }

  const handleDifficultyChange = (difficulty) => {
    setQuizParams(prev => ({ ...prev, difficulty }))
  }

  const handleTopicChange = (e) => {
    setQuizParams(prev => ({
      ...prev,
      topic: e.target.value
    }))
    console.log('Topic value:', e.target.value) // For debugging
  }

  return (
    <div className="quiz-creator">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="creator-content"
      >
        <h1>Customize Your Quiz</h1>
        <p>Refine your quiz topic and settings</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="input-container"
        >
          <div className="input-box">
            <div className="animated-border"></div>
            <textarea
              value={quizParams.topic}
              onChange={handleTopicChange}
              placeholder="Describe your quiz topic in detail (e.g., 'Create a quiz about Ancient Egyptian pyramids, focusing on their construction and historical significance')"
              className="main-input"
              spellCheck="false"
              autoComplete="off"
            />
            <div className="input-actions">
              <button 
                className="create-button"
                onClick={handleGenerateQuiz}
                disabled={!quizParams.topic.trim() || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Custom Quiz'}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="quiz-options">
          <div className="option-group">
            <label>Quiz Type</label>
            <div className="options-grid">
              <button 
                className={`option-button ${quizParams.type === 'multiple-choice' ? 'active' : ''}`}
                onClick={() => handleTypeChange('multiple-choice')}
              >
                Multiple Choice
              </button>
              <button 
                className={`option-button ${quizParams.type === 'true-false' ? 'active' : ''}`}
                onClick={() => handleTypeChange('true-false')}
              >
                True/False
              </button>
              <button 
                className={`option-button ${quizParams.type === 'short-answer' ? 'active' : ''}`}
                onClick={() => handleTypeChange('short-answer')}
              >
                Short Answer
              </button>
            </div>
          </div>

          <div className="option-group">
            <label>Difficulty</label>
            <div className="options-grid">
              <button 
                className={`option-button ${quizParams.difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                className={`option-button ${quizParams.difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button 
                className={`option-button ${quizParams.difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 