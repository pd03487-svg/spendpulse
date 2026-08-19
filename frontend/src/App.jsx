import React from 'react'
import { useAgent, AgentProvider } from './context/AgentContext'
import Navbar from './components/Navbar'
import TaskLaunchpad from './components/TaskLaunchpad'
import LiveBrowserViewport from './components/LiveBrowserViewport'
import PlanTimeline from './components/PlanTimeline'
import ThoughtStream from './components/ThoughtStream'
import HumanApprovalModal from './components/HumanApprovalModal'
import SourceMatrix from './components/SourceMatrix'
import MemoryViewer from './components/MemoryViewer'
import ReportStudio from './components/ReportStudio'
import SingleProductIntelligenceView from './components/SingleProductIntelligenceView'
import ProductComparisonView from './components/ProductComparisonView'
import SettingsModal from './components/SettingsModal'
import TaskHistoryDrawer from './components/TaskHistoryDrawer'
import {
  StopCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Globe,
  Database,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  Scale
} from 'lucide-react'

function BrowserMindDashboard() {
  const { activeTask, stopTask, activeTab, setActiveTab } = useAgent()

  if (!activeTask) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <TaskLaunchpad />
      </main>
    )
  }

  const isRunning =
    activeTask.status === 'running' ||
    activeTask.status === 'planning' ||
    activeTask.status === 'verifying' ||
    activeTask.status === 'synthesizing'

  const report = activeTask.final_report
  const isMultiCompare = report?.compared_products && report.compared_products.length >= 2

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
      {/* Active Goal Header */}
      <div className="glass-panel-elevated p-4 sm:p-5 rounded-3xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Active Objective
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Mode: {activeTask.template_id?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {activeTask.goal}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {isRunning && (
            <button
              onClick={() => stopTask(activeTask.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95 shadow-md"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop Agent</span>
            </button>
          )}

          {report && (
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Full Studio & PDF Export</span>
            </button>
          )}
        </div>
      </div>

      {/* When Report is Ready, Render Focused Product View Directly in Cockpit */}
      {report && activeTab === 'cockpit' && (
        <div className="space-y-6">
          {isMultiCompare ? (
            <ProductComparisonView comparedProducts={report.compared_products} />
          ) : (
            <SingleProductIntelligenceView report={report} />
          )}
        </div>
      )}

      {/* Main Tab Content Switcher */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Autonomous Plan & Subtasks (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-[480px]">
              <PlanTimeline />
            </div>
            <div className="h-[360px]">
              <ThoughtStream />
            </div>
          </div>

          {/* Right Column: Live Browser Viewport & Live Stream (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-[480px]">
              <LiveBrowserViewport />
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Web Sources: <strong className="font-mono text-white">{activeTask.sources?.length || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Extracted Facts: <strong className="font-mono text-white">{activeTask.facts?.length || 0}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('sources')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                Inspect All Sources →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <ReportStudio />}
      {activeTab === 'sources' && <SourceMatrix />}
      {activeTab === 'memory' && <MemoryViewer />}
    </main>
  )
}

export default function App() {
  return (
    <AgentProvider>
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <BrowserMindDashboard />
        <HumanApprovalModal />
        <SettingsModal />
        <TaskHistoryDrawer />
      </div>
    </AgentProvider>
  )
}
