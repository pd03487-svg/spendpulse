import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const AgentContext = createContext(null)

export function AgentProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [templates, setTemplates] = useState([])
  const [settings, setSettings] = useState({
    openai_api_key: '',
    gemini_api_key: '',
    anthropic_api_key: '',
    default_provider: 'heuristic',
    default_model: 'auto',
    safety_level: 'balanced',
    headless_browser: true,
    max_search_results: 5
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [wsStatus, setWsStatus] = useState('disconnected')
  const [activeTab, setActiveTab] = useState('cockpit')

  const wsRef = useRef(null)

  useEffect(() => {
    fetchTemplates()
    fetchTasks()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!activeTask?.id) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setWsStatus('disconnected')
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host
    const wsUrl = `${protocol}//${host}/api/tasks/${activeTask.id}/ws`

    setWsStatus('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        handleWsEvent(payload)
      } catch (err) {
        console.error('Error parsing WS message:', err)
      }
    }

    ws.onerror = (err) => {
      console.warn('WebSocket error:', err)
      setWsStatus('disconnected')
    }

    ws.onclose = () => {
      setWsStatus('disconnected')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [activeTask?.id])

  const handleWsEvent = (msg) => {
    const { event, data } = msg

    setActiveTask((prev) => {
      if (!prev) return prev
      const updated = { ...prev }

      switch (event) {
        case 'initial_snapshot':
          return data

        case 'task_status':
          updated.status = data.status
          if (data.stats) updated.stats = { ...updated.stats, ...data.stats }
          if (data.status === 'completed') {
            fetchTasks()
          }
          break

        case 'plan_update':
          updated.plan = data.plan
          break

        case 'thought_log':
          if (!updated.thought_logs) updated.thought_logs = []
          if (!updated.thought_logs.find((t) => t.id === data.id)) {
            updated.thought_logs = [...updated.thought_logs, data]
          }
          break

        case 'browser_viewport':
          updated.current_url = data.url
          if (data.screenshot_b64) {
            updated.current_screenshot = data.screenshot_b64
          }
          break

        case 'source_visited':
          if (!updated.sources) updated.sources = []
          const existingSrcIdx = updated.sources.findIndex((s) => s.url === data.url)
          if (existingSrcIdx >= 0) {
            const copySources = [...updated.sources]
            copySources[existingSrcIdx] = data
            updated.sources = copySources
          } else {
            updated.sources = [...updated.sources, data]
          }
          break

        case 'fact_discovered':
          if (!updated.facts) updated.facts = []
          if (!updated.facts.find((f) => f.id === data.id)) {
            updated.facts = [...updated.facts, data]
          }
          break

        case 'approval_required':
          updated.pending_approval = data
          updated.status = 'awaiting_approval'
          break

        case 'report_ready':
          updated.final_report = data
          updated.status = 'completed'
          fetchTasks()
          break

        default:
          break
      }

      return updated
    })
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (err) {
      console.warn('Failed to fetch templates:', err)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.warn('Failed to fetch settings:', err)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const res = await fetch('http://localhost:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.error('Failed to update settings:', err)
    }
  }

  const createTask = async ({ goal, template_id, safety_level, max_steps, llm_provider, llm_model }) => {
    try {
      const payload = {
        goal,
        template_id: template_id || 'research',
        safety_level: safety_level || settings.safety_level || 'balanced',
        max_steps: max_steps || 10,
        llm_provider: llm_provider || settings.default_provider || 'heuristic',
        llm_model: llm_model || settings.default_model || 'default',
        multi_agent_mode: true
      }

      const res = await fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setActiveTask(data)
        setActiveTab('cockpit')
        fetchTasks()
        return data
      }
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const stopTask = async (taskId) => {
    try {
      await fetch(`http://localhost:8000/api/tasks/${taskId}/stop`, { method: 'POST' })
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'stop' }))
      }
      setActiveTask((prev) => (prev ? { ...prev, status: 'paused' } : prev))
    } catch (err) {
      console.error('Error stopping task:', err)
    }
  }

  const resolveApproval = async (requestId, approved, feedback = null) => {
    if (!activeTask) return
    try {
      await fetch(`http://localhost:8000/api/tasks/${activeTask.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, approved, feedback })
      })

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'approve',
          request_id: requestId,
          approved,
          feedback
        }))
      }

      setActiveTask((prev) => (prev ? { ...prev, pending_approval: null, status: 'running' } : prev))
    } catch (err) {
      console.error('Error resolving approval:', err)
    }
  }

  const loadTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setActiveTask(data)
        setActiveTab(data.final_report ? 'report' : 'cockpit')
      }
    } catch (err) {
      console.error('Error loading task:', err)
    }
  }

  const exportReport = async (taskId, format) => {
    window.open(`http://localhost:8000/api/tasks/${taskId}/export/${format}`, '_blank')
  }

  return (
    <AgentContext.Provider
      value={{
        tasks,
        activeTask,
        setActiveTask,
        templates,
        settings,
        updateSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        isHistoryOpen,
        setIsHistoryOpen,
        wsStatus,
        activeTab,
        setActiveTab,
        createTask,
        stopTask,
        resolveApproval,
        loadTask,
        exportReport,
        fetchTasks
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
