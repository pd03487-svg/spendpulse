import React, { useState } from 'react'
import {
  Scale,
  ShoppingCart,
  ExternalLink,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Cpu,
  BatteryCharging,
  Layers,
  Check,
  Sliders,
  Filter
} from 'lucide-react'

export default function ProductComparisonView({ comparedProducts }) {
  const [filterQuery, setFilterQuery] = useState('')

  if (!comparedProducts || comparedProducts.length === 0) return null

  const filteredProducts = comparedProducts.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // Extract all distinct spec keys
  const allSpecKeys = Array.from(
    new Set(comparedProducts.flatMap((p) => Object.keys(p.specs || {})))
  )

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-indigo-400" />
            Top Matching Products & Side-by-Side Comparison Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated against your parameters, ranked by battery life, performance, value, and verified buying links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {comparedProducts.length} Top Models Ranked
          </span>
        </div>
      </div>

      {/* Side-by-Side Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod, idx) => {
          const isWinner = idx === 0

          return (
            <div
              key={prod.id || idx}
              className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between relative group ${
                isWinner
                  ? 'bg-gradient-to-b from-indigo-950/70 via-slate-900/90 to-slate-950/95 border-indigo-500/80 shadow-2xl shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                  : 'glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              {/* Award Badge Pill */}
              {prod.badge && (
                <div className="mb-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase ${
                      isWinner
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                    }`}
                  >
                    {prod.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Product Title & Rating */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h4 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{prod.rating || 4.7}</span>
                  </div>
                </div>

                {/* Price Tag Block */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 my-3.5 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {prod.price_inr}
                    </span>
                    {prod.original_price_inr && prod.original_price_inr !== prod.price_inr && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {prod.original_price_inr}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="text-slate-300 font-medium">Store: {prod.best_store}</span>
                    {prod.discount && (
                      <span className="text-emerald-400 font-bold">{prod.discount}</span>
                    )}
                  </div>
                </div>

                {/* Specifications Key-Value List */}
                <div className="space-y-2 mb-4 text-xs">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Core Specifications
                  </h5>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 font-sans">
                    {Object.entries(prod.specs || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 shrink-0 font-medium">{k}:</span>
                        <span className="text-slate-200 font-medium text-right truncate">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros & Cons Preview */}
                {prod.pros && prod.pros.length > 0 && (
                  <div className="space-y-1.5 mb-4 text-[11px]">
                    <div className="text-emerald-400 font-semibold flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{prod.pros[0]}</span>
                    </div>
                    {prod.cons && prod.cons.length > 0 && (
                      <div className="text-rose-400/90 font-medium flex items-start gap-1.5 leading-snug">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{prod.cons[0]}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Buying Link Button */}
              <a
                href={prod.best_buy_url || `https://www.amazon.com/s?k=${encodeURIComponent(prod.name)}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95 shadow-md ${
                  isWinner
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white shadow-indigo-600/20'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Buy {prod.name.split(' ')[0]} on {prod.best_store.split('/')[0].trim()}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          )
        })}
      </div>

      {/* Feature-by-Feature Specification Comparison Table */}
      {allSpecKeys.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Side-by-Side Specification Comparison Table
            </h4>
            <span className="text-xs text-slate-400">Comparing {comparedProducts.length} models</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold">
                  <th className="py-3.5 px-4">Feature / Specification</th>
                  {comparedProducts.map((p, idx) => (
                    <th key={idx} className="py-3.5 px-4 text-indigo-300 font-mono uppercase">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-emerald-400">Price & Discount</td>
                  {comparedProducts.map((p, idx) => (
                    <td key={idx} className="py-3.5 px-4 text-emerald-400 font-mono font-bold">
                      {p.price_inr} <span className="text-[10px] text-slate-400 font-normal">({p.discount || 'Standard'})</span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-200">Best Store Destination</td>
                  {comparedProducts.map((p, idx) => (
                    <td key={idx} className="py-3.5 px-4 text-slate-300">
                      <a
                        href={p.best_buy_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
                      >
                        {p.best_store} <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </td>
                  ))}
                </tr>

                {allSpecKeys.map((specKey) => (
                  <tr key={specKey} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{specKey}</td>
                    {comparedProducts.map((p, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {p.specs?.[specKey] || 'Supported'}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-amber-400">Category Award</td>
                  {comparedProducts.map((p, idx) => (
                    <td key={idx} className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {p.badge || 'Contender'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
