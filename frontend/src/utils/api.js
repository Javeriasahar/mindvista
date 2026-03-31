const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function ingestContent({ text, file }) {
  const formData = new FormData()
  if (file) {
    formData.append('file', file)
  } else {
    formData.append('text', text)
  }
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to process content')
  }
  return res.json()
}

export async function askQuestion(question) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to get answer')
  }
  return res.json()
}

export async function clearKnowledgeBase() {
  const res = await fetch(`${BASE_URL}/clear`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to clear knowledge base')
  return res.json()
}