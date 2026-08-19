import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  Terminal,
  ExternalLink,
  MessageSquare
} from 'lucide-react'

export default function HumanApprovalModal() {
  const { activeTask, resolveApproval } = useAgent()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const approval = activeTask?.pending_approval
  if (!approval) return null

  const handleDecision = async (approved) => {
    try {
      setIsSubmitting(true)
      await resolveApproval(approval.id, approved, feedback.trim() || null)
    } finally {
      setIsSubmitting(false)
      setFeedback('')
    }
  }

  const getRiskBadge = () => {
    switch (approval.risk_level) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose'
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f172a] border border-amber-500/50 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6">
        {/* Glow Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Human Approval Required</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge()}`}>
                  {approval.risk_level} Risk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                The agent paused navigation before executing a sensitive action.
              </p>
            </div>
          </div>
        </div>

        {/* Reason Description Box */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Intercept Reason</h4>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {approval.description}
          </p>
        </div>

        {/* Action Payload Preview */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Proposed Action: <strong className="text-cyan-400 uppercase font-mono">{approval.action_type}</strong></span>
            {approval.target_url && (
              <span className="truncate max-w-[200px] text-slate-500 font-mono text-[11px]">
                {approval.target_url}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
            {Object.entries(approval.payload || {}).map(([k, v]) => (
              v ? (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500">{k}:</span>
                  <span className="text-indigo-300 truncate">{String(v)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {/* Optional User Steering Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            Provide Steering Instructions / Constraints (Optional)
          </label>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Use the free tier search instead, or skip this checkout form..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Decision Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => handleDecision(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject & Skip Action</span>
          </button>

          <button
            onClick={() => handleDecision(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Authorize</span>
          </button>
        </div>
      </div>
    </div>
  )
}
