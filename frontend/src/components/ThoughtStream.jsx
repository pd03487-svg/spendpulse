import React, { useState, useEffect, useRef } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Terminal,
  Brain,
  Globe,
  Scale,
  FileSpreadsheet,
  Shield,
  Copy,
  Check,
  ArrowDownCircle,
  Filter,
  Sparkles
} from 'lucide-react'

const ROLE_STYLES = {
  planner: {
    icon: Brain,
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: 'Planner 🧠'
  },
  researcher: {
    icon: Globe,
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    title: 'Researcher 🌐'
  },
  verifier: {
    icon: Scale,
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'Verifier ⚖️'
  },
  reporter: {
    icon: FileSpreadsheet,
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: 'Reporter 📝'
  },
  safety: {
    icon: Shield,
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    title: 'Safety Guard 🛡️'
  },
  system: {
    icon: Terminal,
    badge: 'bg-slate-700/50 text-slate-300 border-slate-600',
    title: 'System ⚙️'
  }
}

export default function ThoughtStream() {
  const { activeTask } = useAgent()
  const [filterRole, setFilterRole] = useState('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef(null)

  const logs = activeTask?.thought_logs || []

  const filteredLogs = logs.filter((log) => {
    if (filterRole === 'all') return true
    return log.role === filterRole
  })

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const copyAllLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.role.toUpperCase()}] ${l.thought} ${l.action_target ? `-> (${l.action_target})` : ''}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col h-full">
      {/* Stream Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              Multi-Agent Live Trace
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Real-time reasoning, tool calls & DOM observations</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-[11px]">
            {['all', 'researcher', 'verifier', 'reporter', 'safety'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${
                  filterRole === role
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={copyAllLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-2.5 pr-2 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center">
            <Sparkles className="w-5 h-5 text-slate-600 mb-2" />
            <p>Agent reasoning trace will stream here...</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const style = ROLE_STYLES[log.role] || ROLE_STYLES.system
            const RoleIcon = style.icon
            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''

            return (
              <div
                key={log.id || idx}
                className="p-2.5 rounded-lg bg-[#0a0e1a]/80 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}>
                      <RoleIcon className="w-3 h-3" />
                      {style.title}
                    </span>
                    {log.action_type && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action_type}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{timeStr}</span>
                </div>

                {/* Thought Content */}
                <p className="text-slate-200 leading-relaxed font-sans text-xs">
                  {log.thought}
                </p>

                {/* Target URL or Query Pill */}
                {log.action_target && (
                  <div className="mt-1.5 inline-block text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded font-mono truncate max-w-full">
                    Target: {log.action_target}
                  </div>
                )}

                {/* Observation snippet excerpt */}
                {log.observation_snippet && (
                  <div className="mt-2 p-2 rounded bg-slate-950/60 border border-slate-850 text-slate-400 text-[11px] font-mono leading-normal line-clamp-3">
                    <span className="text-emerald-400">Observation:</span> {log.observation_snippet}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>{filteredLogs.length} events logged</span>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded accent-indigo-500"
          />
          <span>Auto-scroll to bottom</span>
        </label>
      </div>
    </div>
  )
}
