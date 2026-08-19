import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Globe,
  Lock,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  Eye,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react'

export default function LiveBrowserViewport() {
  const { activeTask } = useAgent()
  const [isMaximized, setIsMaximized] = useState(false)

  const currentUrl = activeTask?.current_url || 'https://www.google.com/search?q=browsermind'
  const screenshot = activeTask?.current_screenshot
  const isNavigating = activeTask?.status === 'running' || activeTask?.status === 'planning'

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isMaximized
          ? 'fixed inset-4 z-50 bg-slate-950 border-indigo-500 shadow-2xl'
          : 'glass-panel border-slate-800/80 h-full min-h-[420px]'
      }`}
    >
      {/* Browser Chrome Window Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="hidden sm:flex items-center gap-1 ml-3 text-slate-400">
            <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800">
              <RotateCw className={`w-3.5 h-3.5 ${isNavigating ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate font-mono text-[11px] text-slate-200">
              {currentUrl}
            </span>
          </div>
        </div>

        {/* Viewport Actions */}
        <div className="flex items-center gap-2">
          {isNavigating && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Live Stream
            </div>
          )}

          {currentUrl.startsWith('http') && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Open link directly"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isMaximized ? 'Minimize viewport' : 'Expand full screen'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Content Screen */}
      <div className="relative flex-1 bg-[#090d16] flex items-center justify-center overflow-hidden min-h-[340px]">
        {screenshot ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img
              src={screenshot}
              alt="Live browser rendering"
              className="w-full h-full object-contain rounded-lg shadow-xl border border-slate-800/60"
            />
            {/* Visual scanline when active */}
            {isNavigating && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            )}
          </div>
        ) : (
          <div className="text-center p-8 space-y-4 max-w-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Browser Standby</h3>
              <p className="text-xs text-slate-400 mt-1">
                When the agent initiates a search or visits web targets, live headless browser frames will render here in real-time.
              </p>
            </div>
          </div>
        )}

        {/* Floating status pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-lg">
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          <span>Viewport: 1280×800</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">HTTP 200 OK</span>
        </div>
      </div>
    </div>
  )
}
