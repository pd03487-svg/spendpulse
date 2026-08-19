import React, { useState } from 'react'
import {
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Truck,
  Copy,
  Check,
  Award,
  Sparkles,
  Sliders,
  Cpu,
  Smartphone,
  BatteryCharging,
  Camera,
  Wifi,
  HardDrive,
  Gift,
  ThumbsUp,
  ThumbsDown,
  GraduationCap
} from 'lucide-react'

const SPEC_CATEGORY_ICONS = {
  'Display': Smartphone,
  'Performance': Cpu,
  'Battery': BatteryCharging,
  'Camera': Camera,
  'Connectivity': Wifi,
  'Storage': HardDrive,
  'General': Sliders
}

export default function DealsAndSpecsExplorer({ report }) {
  const [copiedCoupon, setCopiedCoupon] = useState(null)
  const [selectedSpecCategory, setSelectedSpecCategory] = useState('all')

  if (!report) return null

  const deals = report.best_buy_deals || []
  const specs = report.specifications || []
  const offers = report.active_offers || []
  const verdict = report.verdict

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2000)
  }

  const categories = ['all', ...Array.from(new Set(specs.map((s) => s.category)))]

  const filteredSpecs = specs.filter((s) => {
    if (selectedSpecCategory === 'all') return true
    return s.category === selectedSpecCategory
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Active Promotional Discounts & Student Perks Banner */}
      {offers.length > 0 && (
        <section className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-violet-950/60 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">Active Student Discounts, Educational Perks & Coupons</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
            {offers.map((off, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 leading-relaxed">
                {off}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Best Buy Retailer Links (if available) */}
      {deals.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                Best Buy Links & Lowest Retailer Prices
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified live merchant pricing, in-stock status, and direct purchase destinations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {deals.length} Active Deals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((deal, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {deal.retailer}
                      </span>
                      <span className="block text-[11px] text-emerald-400 font-semibold mt-0.5 truncate">
                        {deal.deal_tag}
                      </span>
                    </div>

                    {deal.discount && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {deal.discount}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 mb-3 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        {deal.price}
                      </span>
                      {deal.original_price && deal.original_price !== deal.price && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {deal.original_price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300 font-medium truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {deal.availability}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={deal.buy_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 shadow-md transition-all active:scale-95"
                >
                  <span>Visit Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Comprehensive Specifications Sheet */}
      {specs.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Comprehensive Specifications & Hardware Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full technical parameters, processor architecture, battery endurance, and ports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSpecCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                    selectedSpecCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSpecs.map((spec, idx) => {
              const CategoryIcon = SPEC_CATEGORY_ICONS[spec.category] || Sliders

              return (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-100">{spec.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                        {spec.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {spec.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. Expert Review & Buying Guide */}
      {verdict && (
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Expert Verdict & Recommendation</h3>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Best For:</strong> {verdict.best_for}
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-amber-500/30">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl font-mono">
                {verdict.score}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Overall Score
                </span>
                <span className="text-xs font-bold text-white">Out of 10</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
            {verdict.verdict_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" />
                Key Strengths & Advantages
              </h4>
              <div className="space-y-2 text-xs text-slate-200">
                {verdict.pros.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsDown className="w-4 h-4" />
                Trade-offs & Considerations
              </h4>
              <div className="space-y-2 text-xs text-slate-200">
                {verdict.cons.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
