import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, Bot, User, BookOpen, ChevronDown,
  ChevronLeft, AlertTriangle, Info
} from 'lucide-react'
import { askQuestion } from '../utils/api.js'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Hello! I've loaded your knowledge base and I'm ready to answer questions. I'll only respond based on the content you provided — ask me anything!",
  sources: [],
  found: true,
}

export default function ChatInterface({ chunkCount }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const q = input.trim()
    if (!q || loading) return

    const userMsg = { id: Date.now(), role: 'user', text: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await askQuestion(q)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
          found: data.found_in_context,
        },
      ])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `Error: ${e.message}`,
          sources: [],
          found: false,
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* ── Header bar ── */}
      <div className="glass rounded-2xl px-5 py-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sage-400/20 border border-sage-400/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-sage-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">AI Assistant</p>
            <p className="text-slate-500 text-xs">
              <span className="font-mono text-sage-400">{chunkCount}</span> chunks indexed
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-ghost text-xs flex items-center gap-1.5 py-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Knowledge
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg, i) => (
          <ChatBubble key={msg.id} msg={msg} index={i} />
        ))}

        {loading && (
          <div className="flex items-end gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-sage-400/20 border border-sage-400/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-sage-400" />
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-5 py-4">
              <div className="dot-loader flex gap-1.5 items-center h-4">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="glass-strong rounded-2xl p-3 mt-4 flex items-end gap-3">
        <textarea
          ref={inputRef}
          className="flex-1 bg-transparent text-white placeholder-slate-500 font-body text-sm focus:outline-none resize-none min-h-[44px] max-h-[120px] py-2.5 px-2 leading-relaxed"
          placeholder="Ask a question about your content…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ height: 'auto' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-sage-400 hover:bg-sage-500 disabled:opacity-30
                     disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0
                     transition-all duration-200 hover:shadow-lg hover:shadow-sage-400/20"
        >
          <Send className="w-4 h-4 text-ink" />
        </button>
      </div>

      <p className="text-center text-slate-600 text-xs mt-3 font-body">
        Shift+Enter for newline · Enter to send
      </p>
    </div>
  )
}

function ChatBubble({ msg, index }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = msg.role === 'user'

  return (
    <div
      className={`flex items-end gap-3 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-white/10 border border-white/15'
          : 'bg-sage-400/20 border border-sage-400/30'
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-slate-300" />
          : <Bot className="w-3.5 h-3.5 text-sage-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        <div className={`px-5 py-3.5 rounded-2xl font-body text-sm leading-relaxed ${
          isUser
            ? 'bg-white/10 border border-white/10 rounded-br-sm text-white'
            : msg.isError
              ? 'glass border border-red-400/20 rounded-bl-sm text-red-300'
              : !msg.found && msg.id !== 'welcome'
                ? 'glass border border-amber-400/20 rounded-bl-sm text-amber-100'
                : 'glass border border-white/8 rounded-bl-sm text-slate-100'
        }`}>
          {/* Not-found indicator */}
          {!msg.found && !isUser && msg.id !== 'welcome' && !msg.isError && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono mb-2 pb-2 border-b border-amber-400/20">
              <AlertTriangle className="w-3 h-3" />
              Not found in context
            </div>
          )}
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>

        {/* Sources toggle */}
        {!isUser && msg.sources?.length > 0 && msg.found && (
          <button
            onClick={() => setShowSources(v => !v)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors ml-1"
          >
            <BookOpen className="w-3 h-3" />
            {showSources ? 'Hide' : 'Show'} sources ({msg.sources.length})
            <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Source chips */}
        {showSources && (
          <div className="space-y-1.5 animate-fade-in w-full">
            {msg.sources.map((src, i) => (
              <div
                key={i}
                className="glass rounded-xl px-3 py-2 text-xs font-mono text-slate-400 border border-white/5 flex items-start gap-2"
              >
                <Info className="w-3 h-3 text-sage-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{src}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}