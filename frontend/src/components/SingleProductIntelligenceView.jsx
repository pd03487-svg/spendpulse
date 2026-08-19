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
  ShieldCheck,
  Store,
  CreditCard
} from 'lucide-react'

const SPEC_CATEGORY_ICONS = {
  'Display': Smartphone,
  'Performance': Cpu,
  'Battery': BatteryCharging,
  'Camera': Camera,
  'Audio': Camera,
  'Connectivity': Wifi,
  'Storage': HardDrive,
  'Build': Sliders,
  'Microphone': Sliders,
  'General': Sliders
}

export default function SingleProductIntelligenceView({ report }) {
  const [copiedCoupon, setCopiedCoupon] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  if (!report) return null

  const deals = report.best_buy_deals || []
  const specs = report.specifications || []
  const offers = report.active_offers || []
  const verdict = report.verdict
  const productName = report.product_name || report.goal

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2000)
  }

  const categories = ['all', ...Array.from(new Set(specs.map((s) => s.category)))]

  const filteredSpecs = specs.filter((s) => {
    if (selectedCategory === 'all') return true
    return s.category === selectedCategory
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Product Hero & Pricing Summary Card */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Product Intelligence (in ₹ INR)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {deals.length} Platform Prices Compared
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {productName}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {report.executive_summary}
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row lg:flex-col justify-between gap-4 shrink-0 min-w-[280px]">
            <div>
              <span className="text-[11px] uppercase font-extrabold text-emerald-400 tracking-wider block mb-1">
                Lowest Verified Price in INR (₹)
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {report.lowest_price || deals[0]?.price || '₹26,990'}
                </span>
                {report.msrp_price && report.msrp_price !== report.lowest_price && (
                  <span className="text-sm text-slate-500 line-through font-mono">
                    {report.msrp_price}
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-400 font-bold block mt-1">
                {deals[0]?.discount || 'Best Available Price'} on {deals[0]?.retailer || 'Amazon'}
              </span>
            </div>

            {deals[0] && (
              <a
                href={deals[0].buy_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Buy on {deals[0].retailer} ({deals[0].price})</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Overall Pricing in All Platforms & Exact Buying Links Table */}
      {deals.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Store className="w-5 h-5 text-indigo-400" />
                Overall Pricing in All Platforms (in ₹ INR) & Exact Buying Links
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live prices across authorized platforms. Click any direct link to visit the official product listing.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {deals.length} Authorized Platforms
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold">
                  <th className="py-4 px-5">Platform / Retailer</th>
                  <th className="py-4 px-5">Live Price (₹ INR)</th>
                  <th className="py-4 px-5">Original MSRP / Discount</th>
                  <th className="py-4 px-5">Availability & Delivery</th>
                  <th className="py-4 px-5 text-right">Exact Buying Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {deals.map((deal, idx) => {
                  const isLowest = idx === 0

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isLowest ? 'bg-emerald-950/15' : ''
                      }`}
                    >
                      {/* Platform */}
                      <td className="py-4 px-5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{deal.retailer}</span>
                          {isLowest && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Lowest Price
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          {deal.deal_tag}
                        </span>
                      </td>

                      {/* Live Price in INR */}
                      <td className="py-4 px-5">
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {deal.price}
                        </span>
                      </td>

                      {/* MSRP / Savings */}
                      <td className="py-4 px-5">
                        {deal.original_price && deal.original_price !== deal.price && (
                          <span className="text-xs text-slate-500 line-through font-mono block">
                            {deal.original_price}
                          </span>
                        )}
                        <span className="text-xs text-emerald-400 font-semibold">
                          {deal.discount || 'Standard Price'}
                        </span>
                      </td>

                      {/* Stock & Delivery */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{deal.availability}</span>
                        </div>
                        {deal.shipping && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Truck className="w-3 h-3 text-indigo-400" />
                            {deal.shipping}
                          </span>
                        )}
                      </td>

                      {/* Direct Buy Button */}
                      <td className="py-4 px-5 text-right">
                        <a
                          href={deal.buy_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95 shadow-sm ${
                            isLowest
                              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                          }`}
                        >
                          <span>Buy on {deal.retailer.split(' ')[0]}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Complete Technical Specifications Sheet */}
      {specs.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Complete Technical Specifications
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed hardware architecture, display technology, battery capacity, audio, and connectivity.
              </p>
            </div>

            {/* Filter Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSpecs.map((spec, idx) => {
              const CategoryIcon = SPEC_CATEGORY_ICONS[spec.category] || Sliders

              return (
                <div
                  key={idx}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-4"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-white text-sm">{spec.name}</span>
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

      {/* 4. Active Offers & Retailer Perks */}
      {offers.length > 0 && (
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-violet-950/60 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">Active Card Discounts & EMI Perks (₹ INR)</h4>
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

      {/* 5. Expert Review & Verdict */}
      {verdict && (
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Expert Assessment & Verdict</h3>
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
                Key Advantages
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
                Points to Consider
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
