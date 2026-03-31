import { Link, useLocation } from 'react-router-dom'
import { Brain, MessageSquare, BookOpen } from 'lucide-react'

export default function Layout({ children, knowledgeReady }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-sage-400/20 border border-sage-400/30 flex items-center justify-center group-hover:bg-sage-400/30 transition-colors">
              <Brain className="w-4 h-4 text-sage-400" />
            </div>
            <span className="font-display font-bold text-white tracking-tight">
              Mind<span className="text-gradient">Vista</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem
              to="/"
              icon={<BookOpen className="w-3.5 h-3.5" />}
              label="Knowledge"
              active={pathname === '/'}
            />
            <NavItem
              to="/chat"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              label="Chat"
              active={pathname === '/chat'}
              disabled={!knowledgeReady}
            />
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-5 text-slate-600 text-xs font-body">
        MindVista · Smart AI Support Assistant
      </footer>
    </div>
  )
}

function NavItem({ to, icon, label, active, disabled }) {
  if (disabled) {
    return (
      <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body text-slate-600 cursor-not-allowed select-none">
        {icon}
        {label}
      </span>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
        active
          ? 'bg-sage-400/15 text-sage-300 border border-sage-400/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}