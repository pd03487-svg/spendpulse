import React from 'react'
import { useAgent } from '../context/AgentContext'
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Brain,
  Globe,
  Scale,
  FileSpreadsheet,
  ChevronRight,
  ListTodo
} from 'lucide-react'

const AGENT_ICONS = {
  planner: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Planner' },
  researcher: { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'Researcher' },
  verifier: { icon: Scale, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Verifier' },
  reporter: { icon: FileSpreadsheet, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Reporter' }
}

export default function PlanTimeline() {
  const { activeTask } = useAgent()

  const plan = activeTask?.plan || []
  const completedCount = plan.filter((p) => p.status === 'completed').length
  const progressPercent = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col h-full">
      {/* Header with progress */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Autonomous Plan</h3>
            <p className="text-[11px] text-slate-400">Dynamic Multi-Agent Subtasks</p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold text-indigo-400">{progressPercent}%</span>
          <p className="text-[10px] text-slate-400">{completedCount} of {plan.length} done</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {plan.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Decomposing goal into executable subtasks...</p>
          </div>
        ) : (
          plan.map((step, idx) => {
            const agentInfo = AGENT_ICONS[step.assigned_agent] || AGENT_ICONS.researcher
            const AgentIcon = agentInfo.icon
            const isCurrent = step.status === 'in_progress'
            const isDone = step.status === 'completed'

            return (
              <div
                key={step.id || idx}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : isDone
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                    : 'bg-slate-900/20 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {step.order || idx + 1}
                    </span>
                    <h4 className="font-semibold text-slate-100 leading-tight">{step.title}</h4>
                  </div>

                  {/* Status icon */}
                  <div>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isCurrent && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
                    {step.status === 'pending' && <Clock className="w-4 h-4 text-slate-500 shrink-0" />}
                    {step.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed mb-2">
                  {step.objective}
                </p>

                {/* Subtask meta */}
                <div className="flex items-center justify-between pl-7 pt-1.5 border-t border-slate-800/60 text-[10px]">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${agentInfo.bg} ${agentInfo.color} font-medium`}>
                    <AgentIcon className="w-3 h-3" />
                    <span>{agentInfo.label} Agent</span>
                  </div>

                  {step.result_summary && (
                    <span className="text-emerald-400 truncate max-w-[140px] font-medium">
                      ✓ {step.result_summary}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
