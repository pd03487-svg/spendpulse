import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Sun,
  Moon,
  Coins,
  Bell,
  Menu,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useExpense, CURRENCIES } from '../../context/ExpenseContext'

const PAGE_TITLES = {
  '/dashboard': { title: 'Financial Overview', subtitle: 'Real-time cash flow & core metrics' },
  '/transactions': { title: 'Transactions Ledger', subtitle: 'View, filter, edit, and organize records' },
  '/analytics': { title: 'Visual Analytics & Charts', subtitle: 'Monthly trends, distributions & spending patterns' },
  '/budgets': { title: 'Budgets & Categories', subtitle: 'Manage limits, goals, and customized categories' },
  '/reports': { title: 'Report Studio & Exports', subtitle: 'Generate PDF statements, CSV, and JSON backups' },
  '/settings': { title: 'Preferences & Storage', subtitle: 'Currency, themes, backups, and sample data' },
}

export default function Header({ onOpenAddModal, onToggleMobileMenu }) {
  const location = useLocation()
  const { theme, toggleTheme, currency, setCurrency, currentMonthBudgets } = useExpense()
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)
  const [showAlertMenu, setShowAlertMenu] = useState(false)

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: 'SpendPulse',
    subtitle: 'Expense & Income Management',
  }

  const exceededBudgets = currentMonthBudgets.filter((b) => b.status === 'exceeded' || b.status === 'warning')

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Title & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn-icon mobile-menu-btn"
          style={{ display: 'none' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {currentPage.title}
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {currentPage.subtitle}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Currency Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Coins size={15} color="var(--primary)" />
            <span>{currency.code} ({currency.symbol})</span>
          </button>

          {showCurrencyMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 200,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.35rem 0.5rem' }}>
                Select Active Currency
              </div>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code)
                    setShowCurrencyMenu(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: c.code === currency.code ? 'var(--primary)' : 'var(--text-primary)',
                    backgroundColor: c.code === currency.code ? 'var(--primary-light)' : 'transparent',
                    fontWeight: c.code === currency.code ? 700 : 500,
                  }}
                >
                  <span>{c.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Budget Warning Alerts Notification */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="btn-icon"
            style={{ position: 'relative' }}
            title="Budget Alerts"
          >
            <Bell size={18} />
            {exceededBudgets.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--expense)',
                }}
              />
            )}
          </button>

          {showAlertMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 300,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.75rem',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Category Budget Alerts</span>
                <span className="badge badge-neutral">{exceededBudgets.length} Active</span>
              </div>

              <div style={{ maxHeight: 220, overflowY: 'auto', padding: '0.5rem 0' }}>
                {exceededBudgets.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    🎉 All category expenses are within budget this month!
                  </div>
                ) : (
                  exceededBudgets.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: b.status === 'exceeded' ? 'var(--expense-light)' : 'var(--warning-light)',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{b.name}</span>
                        <span style={{ color: b.status === 'exceeded' ? 'var(--expense)' : 'var(--warning)' }}>
                          {b.rawPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {b.status === 'exceeded' ? 'Exceeded limit by ' : 'Approaching limit: '}
                        {currency.symbol}{Math.abs(b.remaining).toFixed(0)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Quick Add Income / Expense */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => onOpenAddModal('income')}
            className="btn btn-success btn-sm"
            title="Quick Add Income"
          >
            <TrendingUp size={15} />
            <span>Income</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="btn btn-danger btn-sm"
            title="Quick Add Expense"
          >
            <TrendingDown size={15} />
            <span>Expense</span>
          </button>
        </div>
      </div>
    </header>
  )
}
