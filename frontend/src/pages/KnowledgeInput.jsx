import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, Type, Sparkles,
  CheckCircle2, ChevronRight, Trash2, AlertCircle
} from 'lucide-react'
import { ingestContent, clearKnowledgeBase } from '../utils/api.js'

export default function KnowledgeInput({ onSuccess, knowledgeReady, chunkCount, onClear }) {
  const [mode, setMode] = useState('text')        // 'text' | 'file'
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  async function handleProcess() {
    setError('')
    if (mode === 'text' && !text.trim()) { setError('Please paste some content first.'); return }
    if (mode === 'file' && !file) { setError('Please select a .txt file.'); return }

    setLoading(true)
    try {
      const result = await ingestContent(mode === 'file' ? { file } : { text })
      onSuccess(result.chunk_count)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    try {
      await clearKnowledgeBase()
      onClear()
      setText('')
      setFile(null)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  function handleFileDrop(e) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.txt')) setFile(dropped)
    else setError('Only .txt files are supported.')
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      {/* ── Hero ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5 text-sage-300 text-xs font-mono tracking-wider uppercase">
          <Sparkles className="w-3 h-3" />
          Step 1 of 2
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">
          Add Your <span className="text-gradient">Knowledge Base</span>
        </h1>
        <p className="text-slate-400 font-body text-base leading-relaxed max-w-md mx-auto">
          Paste your content or upload a text file. The AI will only answer questions from this context.
        </p>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="glass rounded-2xl p-1 flex gap-1 mb-6">
        <TabBtn active={mode === 'text'} onClick={() => setMode('text')} icon={<Type className="w-4 h-4" />} label="Paste Text" />
        <TabBtn active={mode === 'file'} onClick={() => setMode('file')} icon={<Upload className="w-4 h-4" />} label="Upload File" />
      </div>

      {/* ── Input Area ── */}
      {mode === 'text' ? (
        <textarea
          className="input-field min-h-[260px] resize-none font-mono text-sm leading-relaxed mb-4"
          placeholder="Paste your FAQ, product docs, notes, or any reference content here…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      ) : (
        <div
          className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-sage-400/40 transition-colors cursor-pointer min-h-[260px] flex flex-col items-center justify-center gap-4 mb-4"
          onDragOver={e => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={e => setFile(e.target.files[0])}
          />
          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-sage-400/15 border border-sage-400/30 flex items-center justify-center">
                <FileText className="w-7 h-7 text-sage-400" />
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-white">{file.name}</p>
                <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-body text-white font-medium">Drop your .txt file here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm font-body bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Success State ── */}
      {knowledgeReady && (
        <div className="glass-strong rounded-2xl p-5 mb-5 border border-sage-400/20 glow-sage animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-sage-400 flex-shrink-0" />
              <div>
                <p className="font-display font-semibold text-white">Knowledge base ready</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  Content split into <span className="text-sage-300 font-mono">{chunkCount}</span> chunks · embeddings generated
                </p>
              </div>
            </div>
            <button onClick={handleClear} className="text-slate-500 hover:text-red-400 transition-colors" title="Clear knowledge base">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3">
        {!knowledgeReady ? (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="dot-loader flex gap-1">
                  <span /><span /><span />
                </div>
                Processing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Process Content
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/chat')}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            Go to Chat
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Info chips ── */}
      <div className="flex flex-wrap gap-2 mt-8 justify-center">
        {['RAG-powered retrieval', 'Gemini embeddings', 'Context-only answers', 'No hallucinations'].map(tag => (
          <span key={tag} className="glass text-slate-400 text-xs font-mono px-3 py-1 rounded-full border border-white/5">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
        active
          ? 'bg-sage-400/20 text-sage-300 border border-sage-400/20'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}