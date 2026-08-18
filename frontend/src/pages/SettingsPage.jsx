import React, { useState, useRef } from 'react'
import {
  Settings,
  Coins,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Info,
} from 'lucide-react'
import { useExpense, CURRENCIES } from '../context/ExpenseContext'

export default function SettingsPage() {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    transactions,
    categories,
    resetToDemoData,
    clearAllData,
    exportToJSON,
    importFromJSON,
  } = useExpense()

  const [notification, setNotification] = useState(null)
  const fileInputRef = useRef(null)

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleResetDemo = () => {
    if (window.confirm('Reset all ledger data and restore realistic 4-month demo dataset?')) {
      resetToDemoData()
      showNotice('Successfully loaded realistic demo dataset!')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
      clearAllData()
      showNotice('All transaction records have been erased.', 'warning')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const res = importFromJSON(content)
        if (res.success) {
          showNotice(`Successfully imported ${res.count} transactions from backup!`)
        } else {
          showNotice(`Failed to import backup: ${res.error}`, 'error')
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Calculate local storage size approximation
  const storageSizeBytes = useMemoStorageSize()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 900 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Preferences & Data Engine
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Configure base currency, design appearance, local backups, and storage controls
        </p>
      </div>

      {/* Notification banner if present */}
      {notification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: notification.type === 'error' ? 'var(--expense-light)' : 'var(--income-light)',
            color: notification.type === 'error' ? 'var(--expense)' : 'var(--income)',
            border: `1px solid ${notification.type === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Currency & Localization Settings */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Coins size={18} color="var(--primary)" />
              <span>Base Currency & Locale</span>
            </h3>
            <p className="card-subtitle">Choose the default currency symbol and formatting for numbers</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {CURRENCIES.map((c) => {
            const isSelected = c.code === currency.code
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.code}</div>
                </div>
                <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {c.symbol}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Theme & Display */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {theme === 'dark' ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--warning)" />}
              <span>Interface Theme</span>
            </h3>
            <p className="card-subtitle">Switch between modern high-contrast Dark mode and clean Light mode</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className="btn"
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: theme === 'dark' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
              border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Moon size={24} color={theme === 'dark' ? 'var(--primary)' : 'var(--text-muted)'} />
            <div style={{ fontWeight: 700 }}>Dark Slate (Recommended)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deep contrast, eye friendly</div>
          </button>

          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className="btn"
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: theme === 'light' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
              border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sun size={24} color={theme === 'light' ? 'var(--warning)' : 'var(--text-muted)'} />
            <div style={{ fontWeight: 700 }}>Clean Light</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crisp daylight appearance</div>
          </button>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Database size={18} color="var(--info)" />
              <span>Data Persistence & Backup</span>
            </h3>
            <p className="card-subtitle">Export full database backup, restore records, or seed demo test data</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Download JSON Backup */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={16} color="var(--primary)" />
                <span>Export JSON Backup</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Save all {transactions.length} transactions and {categories.length} categories to a secure JSON file.
              </div>
            </div>
            <button onClick={exportToJSON} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Download Backup File
            </button>
          </div>

          {/* Import JSON Backup */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Upload size={16} color="var(--income)" />
                <span>Restore from Backup</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Load and merge records from a previously exported SpendPulse JSON backup.
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Choose Backup File
            </button>
          </div>

          {/* Populate Demo Data */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RotateCcw size={16} color="var(--warning)" />
                <span>Seed Sample Dataset</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Populate 4 months of realistic salary, groceries, rent, and utility records.
              </div>
            </div>
            <button onClick={handleResetDemo} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Load Demo Dataset
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ color: 'var(--expense)' }}>
              <Trash2 size={18} />
              <span>Danger Zone</span>
            </h3>
            <p className="card-subtitle">Permanent actions that affect your local ledger</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'var(--expense-light)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--expense)' }}>
              Clear All Transactions
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Delete all {transactions.length} recorded income and expense transactions. Categories and settings will be preserved.
            </div>
          </div>
          <button onClick={handleClearAll} className="btn btn-danger btn-sm">
            Erase Transactions
          </button>
        </div>
      </div>

      {/* System & Storage Telemetry */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDrive size={15} color="var(--primary)" />
          <span>Offline-First Local Storage: ~{storageSizeBytes} KB used</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={15} color="var(--income)" />
          <span>Client-Side Encryption Ready</span>
        </div>
      </div>
    </div>
  )
}

function useMemoStorageSize() {
  try {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('spendpulse')) {
        total += (localStorage[key].length * 2)
      }
    }
    return (total / 1024).toFixed(2)
  } catch (e) {
    return '0.00'
  }
}
