import React from 'react'
import { useAgent } from '../context/AgentContext'
import {
  History,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Award
} from 'lucide-react'

export default function TaskHistoryDrawer() {
  const { isHistoryOpen, setIsHistoryOpen, tasks, loadTask, activeTask } = useAgent()

  if (!isHistoryOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0b0f19] border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-left">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Research Sessions</h3>
                <p className="text-xs text-slate-400">{tasks.length} tasks recorded</p>
              </div>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Tasks */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-3 pr-1">
            {tasks.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                No past tasks yet. Launch a new goal from the launchpad.
              </div>
            ) : (
              tasks.map((t) => {
                const isCurrent = activeTask?.id === t.id
                const isCompleted = t.status === 'completed'
                const timeStr = t.created_at ? new Date(t.created_at).toLocaleString() : ''

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      loadTask(t.id)
                      setIsHistoryOpen(false)
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs ${
                      isCurrent
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{timeStr}</span>
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300">
                          {t.status}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-100 line-clamp-2 leading-relaxed mb-2">
                      {t.goal}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span>{t.plan?.length || 0} subtasks</span>
                      {t.final_report && (
                        <span className="text-cyan-400 font-mono font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" /> {t.final_report.evidence_score}% score
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
