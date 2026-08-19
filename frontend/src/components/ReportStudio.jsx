import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import SingleProductIntelligenceView from './SingleProductIntelligenceView'
import ProductComparisonView from './ProductComparisonView'
import DealsAndSpecsExplorer from './DealsAndSpecsExplorer'
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Printer,
  Copy,
  Check,
  Layers,
  Scale
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportStudio() {
  const { activeTask, exportReport } = useAgent()
  const [copied, setCopied] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const report = activeTask?.final_report
  if (!report) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center glass-panel rounded-3xl border border-slate-800">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Final Report in Synthesis</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The Reporter Agent is currently aggregating multi-platform pricing, cross-checking verification scores, and assembling specifications.
        </p>
      </div>
    )
  }

  const copyMarkdown = () => {
    navigator.clipboard.writeText(report.markdown_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClientPdfExport = () => {
    try {
      setIsExportingPdf(true)
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(30, 41, 59)
      doc.text('BrowserMind Product Intelligence Report', 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 14, 28)
      doc.text(`Evidence Score: ${report.evidence_score}% | Task: ${report.task_id}`, 14, 34)

      // Goal
      doc.setFontSize(12)
      doc.setTextColor(15, 23, 42)
      doc.text(`Target: ${report.goal}`, 14, 44)

      // Executive Summary
      doc.setFontSize(14)
      doc.text('Executive Summary', 14, 56)
      doc.setFontSize(10)
      doc.setTextColor(71, 85, 105)
      const splitSummary = doc.splitTextToSize(report.executive_summary.replace(/\*\*/g, ''), 180)
      doc.text(splitSummary, 14, 64)

      let curY = 64 + splitSummary.length * 6 + 10

      // Multi-Platform Deals Table
      if (report.best_buy_deals && report.best_buy_deals.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(15, 23, 42)
        doc.text('Overall Pricing in All Platforms & Buying Links', 14, curY)
        curY += 6

        const dealsBody = report.best_buy_deals.map((d) => [
          d.retailer,
          d.price,
          d.discount || 'Active Deal',
          d.availability,
          d.shipping || 'Standard'
        ])

        autoTable(doc, {
          startY: curY,
          head: [['Platform / Retailer', 'Live Price', 'Discount / Offer', 'Stock Status', 'Delivery']],
          body: dealsBody,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        })

        curY = doc.lastAutoTable.finalY + 12
      }

      // Specifications Table
      if (report.specifications && report.specifications.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(15, 23, 42)
        doc.text('Complete Technical Specifications', 14, curY)
        curY += 6

        const specBody = report.specifications.map((s) => [s.category, s.name, s.value])

        autoTable(doc, {
          startY: curY,
          head: [['Category', 'Specification', 'Details']],
          body: specBody,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] }
        })

        curY = doc.lastAutoTable.finalY + 12
      }

      doc.save(`browsermind_${(report.product_name || 'report').replace(/\s+/g, '_')}.pdf`)
    } catch (e) {
      console.error('PDF export error:', e)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const isMultiCompare = report.compared_products && report.compared_products.length >= 2

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Pricing & Specs Verified
            </span>
            <span className="text-xs text-slate-400 font-mono">Task ID: {report.task_id}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {report.product_name ? `${report.product_name} Intelligence Report` : 'Product Intelligence Studio'}
          </h2>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Markdown</span>
          </button>

          <button
            onClick={() => exportReport(activeTask.id, 'md')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            onClick={() => exportReport(activeTask.id, 'json')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleClientPdfExport}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Render Single Product View or Multi Comparison View */}
      {isMultiCompare ? (
        <ProductComparisonView comparedProducts={report.compared_products} />
      ) : (
        <SingleProductIntelligenceView report={report} />
      )}

      {/* Verified Bibliography */}
      {report.verified_sources && report.verified_sources.length > 0 && (
        <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Citations & Web Bibliography
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.verified_sources.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="truncate mr-3">
                  <span className="font-mono text-[11px] text-cyan-400 block">{s.domain}</span>
                  <span className="text-slate-300 truncate block font-medium">{s.title}</span>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
