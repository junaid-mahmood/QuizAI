import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import QuizCreator from './components/QuizCreator'
import QuizTaking from './components/QuizTaking'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<QuizCreator />} />
          <Route path="/take-quiz" element={<QuizTaking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
