import React from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Sparkles,
  History,
  Settings,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Layers,
  Compass
} from 'lucide-react'

export default function Navbar() {
  const {
    activeTask,
    setActiveTask,
    tasks,
    setIsSettingsOpen,
    setIsHistoryOpen,
    activeTab,
    setActiveTab
  } = useAgent()

  const getStatusBadge = () => {
    if (!activeTask) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-750">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Autonomous Engine Ready
        </span>
      )
    }

    switch (activeTask.status) {
      case 'running':
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            Navigating & Reasoning
          </span>
        )
      case 'awaiting_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5" />
            Human Approval Required
          </span>
        )
      case 'verifying':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Verifying Evidence
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Analysis Complete
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Paused
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {activeTask.status}
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080d1a]/95 backdrop-blur-2xl px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            if (activeTask) setActiveTab('cockpit')
            else setActiveTask(null)
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">
                Browser<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Mind</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Autonomous Web Navigation, Product Intelligence & Comparison Studio
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="hidden md:flex items-center gap-3">
          {getStatusBadge()}

          {activeTask && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('cockpit')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'cockpit'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Live Cockpit
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'report'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Products & Report
                {activeTask.final_report && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'sources'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Sources ({activeTask.sources?.length || 0})
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTask(null)
              setActiveTab('cockpit')
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Search & Compare</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Search History"
          >
            <History className="w-4 h-4" />
            {tasks.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {tasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Settings & LLM API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
