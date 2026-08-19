import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Layers,
  Search,
  Sparkles,
  Database
} from 'lucide-react'

export default function SourceMatrix() {
  const { activeTask } = useAgent()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('sources') // 'sources' | 'facts'

  const sources = activeTask?.sources || []
  const facts = activeTask?.facts || []

  const filteredSources = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFacts = facts.filter(
    (f) =>
      f.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.claim.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Source Intelligence & Fact Verification Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of visited domains, authority trust ratings, and cross-referenced claims.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('sources')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSubTab === 'sources'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visited Sources ({sources.length})
            </button>
            <button
              onClick={() => setActiveSubTab('facts')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSubTab === 'facts'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified Facts ({facts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter sources, domains, claims, or entity values..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
        />
      </div>

      {/* Content View */}
      {activeSubTab === 'sources' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm">
              No sources visited yet for this task.
            </div>
          ) : (
            filteredSources.map((src) => {
              const trustPercent = Math.round(src.trust_score * 100)
              return (
                <div
                  key={src.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {src.domain}
                          </span>
                          <h4 className="font-bold text-sm text-slate-100 line-clamp-1">
                            {src.title}
                          </h4>
                        </div>
                      </div>

                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        title="Open external webpage"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {src.content_summary && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
                        {src.content_summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    {/* Trust Rating */}
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400 text-[11px]">Domain Trust:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${trustPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-emerald-400">
                          {trustPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Visits: <strong className="text-slate-200 font-mono">{src.visit_count}</strong></span>
                      <span>Facts: <strong className="text-indigo-400 font-mono">{src.extracted_facts_count}</strong></span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* Facts Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm">
              No facts extracted yet. Facts will appear here as the researcher inspects web documents.
            </div>
          ) : (
            filteredFacts.map((fact) => {
              const isCorroborated = fact.corroboration_count > 1
              const confidencePercent = Math.round(fact.confidence * 100)

              return (
                <div
                  key={fact.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    fact.is_conflicting
                      ? 'bg-rose-950/30 border-rose-500/50 glow-rose'
                      : isCorroborated
                      ? 'glass-panel border-emerald-500/30 glow-emerald'
                      : 'glass-panel border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-300 font-mono">
                      {fact.entity}
                    </span>
                    {fact.is_conflicting ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Discrepancy
                      </span>
                    ) : isCorroborated ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Corroborated ({fact.corroboration_count}x)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        Documented
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-100 leading-relaxed mb-2">
                    {fact.claim}
                  </p>

                  {fact.conflicting_details && (
                    <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30 mb-2">
                      {fact.conflicting_details}
                    </p>
                  )}

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[150px]">
                      via {fact.source_title}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {confidencePercent}% conf.
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
