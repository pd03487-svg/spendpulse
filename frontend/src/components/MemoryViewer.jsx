import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Brain,
  Search,
  Database,
  Layers,
  Sparkles,
  Link,
  Code,
  Tag
} from 'lucide-react'

export default function MemoryViewer() {
  const { activeTask } = useAgent()
  const [filterQuery, setFilterQuery] = useState('')

  const facts = activeTask?.facts || []
  const sources = activeTask?.sources || []

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Autonomous Agent Memory & Knowledge Graph</h2>
            <p className="text-xs text-slate-400">
              In-memory TF-IDF semantic embeddings, entity-relation store, and visited state cache.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Entities & Attributes */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            Extracted Entity & Feature Memory Nodes ({facts.length})
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {facts.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No entities in memory.</p>
            ) : (
              facts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[11px] text-cyan-300 font-bold block mb-1">
                      {fact.entity}
                    </span>
                    <p className="text-slate-200 font-sans">{fact.claim}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Source: {fact.source_title} ({fact.source_url})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                    {Math.round(fact.confidence * 100)}% conf
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Search Queries & Index Meta */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Vector Index & Stats
          </h3>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Indexed Documents:</span>
              <strong className="text-indigo-400 font-mono">{sources.length}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Extracted Claims:</span>
              <strong className="text-cyan-400 font-mono">{facts.length}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Corroboration Factor:</span>
              <strong className="text-emerald-400 font-mono">
                {facts.filter((f) => f.corroboration_count > 1).length} facts
              </strong>
            </div>
          </div>

          <h4 className="font-bold text-xs text-slate-300 pt-2">Visited Target URLs</h4>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {sources.map((s) => (
              <div key={s.id} className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-[11px] truncate">
                <span className="font-mono text-indigo-400 block">{s.domain}</span>
                <span className="text-slate-400 truncate block">{s.url}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
