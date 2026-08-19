import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Sparkles,
  ArrowRight,
  Shield,
  Sliders,
  ChevronDown,
  ChevronUp,
  Microscope,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Github,
  Compass,
  TrendingUp,
  Zap,
  Search,
  CheckCircle2,
  Tag
} from 'lucide-react'

const ICON_MAP = {
  GraduationCap,
  ShoppingCart,
  Microscope,
  Briefcase,
  Github,
  Compass,
  TrendingUp
}

const POPULAR_QUERIES = [
  'find laptops under 80000 for students',
  'Compare MacBook Air M3 vs ASUS Zenbook 14 OLED vs Lenovo ThinkPad',
  'Best wireless noise-cancelling headphones under 25000',
  'Top lightweight developer ultrabooks with 32GB RAM and 15h battery',
  'Compare iPhone 16 Pro vs Samsung Galaxy S24 Ultra prices and specs'
]

export default function TaskLaunchpad() {
  const { templates, createTask, settings } = useAgent()
  const [goal, setGoal] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('student_finder')
  const [safetyLevel, setSafetyLevel] = useState('balanced')
  const [maxSteps, setMaxSteps] = useState(10)
  const [llmProvider, setLlmProvider] = useState(settings.default_provider || 'heuristic')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleTemplateSelect = (tmpl) => {
    setSelectedTemplate(tmpl.id)
    setGoal(tmpl.example_goal)
    if (tmpl.default_safety) setSafetyLevel(tmpl.default_safety)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!goal.trim() || isLoading) return

    try {
      setIsLoading(true)
      await createTask({
        goal: goal.trim(),
        template_id: selectedTemplate,
        safety_level: safetyLevel,
        max_steps: maxSteps,
        llm_provider: llmProvider
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 animate-fade-in space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Autonomous AI Browser Agent for Product & Deep Web Research</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Search, Compare & Buy with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
            BrowserMind AI
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Provide any parameters or criteria (e.g. <em>"find laptops under 80000 for students"</em>). The agent autonomously navigates live web pages, extracts complete specifications, compares models side-by-side, and compiles verified buying links with active discounts.
        </p>
      </div>

      {/* Main Search & Command Box */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 opacity-30 group-hover:opacity-60 blur-xl transition duration-500"></div>

          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-[#0c1222] border border-slate-750 rounded-2xl p-2.5 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-3.5 py-2">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. find laptops under 80000 for students, compare specs & best buy links..."
                className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!goal.trim() || isLoading}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <span>Search & Compare</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-400" /> Popular Prompts:
          </span>
          {POPULAR_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setGoal(q)}
              className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400 pt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Safety Guard: <strong className="text-slate-200 capitalize">{safetyLevel}</strong>
            </span>
            <span>•</span>
            <span>
              Autonomous Subtasks: <strong className="text-indigo-400">{maxSteps} steps</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Agent Settings</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced Drawer */}
        {showAdvanced && (
          <div className="mt-3 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Safety Governance</label>
              <select
                value={safetyLevel}
                onChange={(e) => setSafetyLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="strict">Strict (Ask approval before forms & checkouts)</option>
                <option value="balanced">Balanced (Ask approval for payments & mutations)</option>
                <option value="autonomous">Autonomous (Automatic full research execution)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300 font-semibold">Subtask Decomposition Depth</label>
                <span className="font-mono text-indigo-400 font-bold">{maxSteps} steps</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Multi-Agent Intelligence</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="heuristic">Built-in Autonomous Engine (Instant)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="gemini">Google Gemini (Flash)</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Preset Cards Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Specialized Research & Comparison Presets
          </h2>
          <span className="text-xs text-slate-400">Click any preset to load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => {
            const IconComp = ICON_MAP[tmpl.icon] || Sparkles
            const isSelected = selectedTemplate === tmpl.id

            return (
              <div
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tmpl.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1.5">{tmpl.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tmpl.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-indigo-400 font-semibold">~{tmpl.recommended_steps} steps</span>
                  <span className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                    Select Preset →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
