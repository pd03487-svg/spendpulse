import React, { useState, useEffect } from 'react'
import { useAgent } from '../context/AgentContext'
import {
  Settings,
  X,
  Key,
  Shield,
  Eye,
  Check,
  Save,
  Cpu,
  Globe,
  Sliders
} from 'lucide-react'

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings } = useAgent()
  const [formData, setFormData] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFormData({ ...settings })
  }, [settings])

  if (!isSettingsOpen) return null

  const handleSave = async (e) => {
    e.preventDefault()
    await updateSettings(formData)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setIsSettingsOpen(false)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f172a] border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">BrowserMind Agent Settings</h3>
              <p className="text-xs text-slate-400">LLM Provider Keys & Automation Rules</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              OpenAI API Key
            </label>
            <input
              type="password"
              value={formData.openai_api_key || ''}
              onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={formData.gemini_api_key || ''}
              onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
              placeholder="AIza..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          {/* Anthropic Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Anthropic Claude API Key
            </label>
            <input
              type="password"
              value={formData.anthropic_api_key || ''}
              onChange={(e) => setFormData({ ...formData, anthropic_api_key: e.target.value })}
              placeholder="sk-ant-..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          {/* Default Engine */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Default Reasoning Engine</label>
              <select
                value={formData.default_provider}
                onChange={(e) => setFormData({ ...formData, default_provider: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="heuristic">Built-in Autonomous Engine</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Default Safety Mode</label>
              <select
                value={formData.safety_level}
                onChange={(e) => setFormData({ ...formData, safety_level: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="balanced">Balanced</option>
                <option value="strict">Strict</option>
                <option value="autonomous">Autonomous</option>
              </select>
            </div>
          </div>

          {/* Browser Headless mode */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Headless Browser Mode</span>
                <span className="text-[10px] text-slate-400">Stream screenshots in background</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.headless_browser}
              onChange={(e) => setFormData({ ...formData, headless_browser: e.target.checked })}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
