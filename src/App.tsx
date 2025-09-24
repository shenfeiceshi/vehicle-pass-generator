import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Apply from './pages/Apply'
import Result from './pages/Result'
import History from './pages/History'
import Share from './pages/Share'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/share/:id" element={<Share />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
