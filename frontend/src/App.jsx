import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import KnowledgeInput from './pages/KnowledgeInput.jsx'
import ChatInterface from './pages/ChatInterface.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  const [knowledgeReady, setKnowledgeReady] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)

  return (
    <Layout knowledgeReady={knowledgeReady}>
      <Routes>
        <Route
          path="/"
          element={
            <KnowledgeInput
              onSuccess={(count) => {
                setChunkCount(count)
                setKnowledgeReady(true)
              }}
              knowledgeReady={knowledgeReady}
              chunkCount={chunkCount}
              onClear={() => { setKnowledgeReady(false); setChunkCount(0) }}
            />
          }
        />
        <Route
          path="/chat"
          element={
            knowledgeReady
              ? <ChatInterface chunkCount={chunkCount} />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Layout>
  )
}