import { useState } from 'react'
import InputSection from './components/InputSection'
import ResultSection from './components/ResultSection'
import { analyzeHierarchy } from './services/api'

function App() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (dataArray) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await analyzeHierarchy(dataArray)
      setResult(response)
    } catch (err) {
      setError(err.message || 'Failed to connect to the server. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Hierarchy Analyser</h1>
        <p className="subtitle">SRM Full Stack Engineering Challenge</p>
      </header>

      <main>
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
        
        <ResultSection result={result} />
      </main>
    </div>
  )
}

export default App
