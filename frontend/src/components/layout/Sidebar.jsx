import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  FileSpreadsheet,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useExpense } from '../../context/ExpenseContext'

export default function Sidebar({ collapsed, setCollapsed, onOpenAddModal }) {
  const { currentMonthBudgets } = useExpense()
  const exceededCount = currentMonthBudgets.filter((b) => b.status === 'exceeded').length

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ReceiptText },
    { to: '/analytics', label: 'Analytics & Charts', icon: PieChart },
    { to: '/budgets', label: 'Budgets & Categories', icon: Target, badge: exceededCount > 0 ? exceededCount : null },
    { to: '/reports', label: 'Export Reports', icon: FileSpreadsheet },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-smooth)',
        overflowX: 'hidden',
      }}
    >
      {/* Brand Logo Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-primary)',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SpendPulse
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Financial Intelligence
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="btn-icon"
            title="Collapse Sidebar"
            style={{ width: 28, height: 28 }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Quick Add CTA */}
      <div style={{ padding: collapsed ? '1rem 0.5rem' : '1.25rem 1.25rem 0.75rem 1.25rem' }}>
        <button
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: collapsed ? '0.7rem 0' : '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
          }}
          title="New Transaction"
        >
          <Plus size={18} />
          {!collapsed && <span>New Transaction</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: collapsed ? '0.75rem 0' : '0.7rem 0.85rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: 'var(--expense)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Toggle / Status */}
      {collapsed && (
        <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setCollapsed(false)}
            className="btn-icon"
            title="Expand Sidebar"
            style={{ width: 32, height: 32 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {!collapsed && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--income)' }} />
            <span>SpendPulse v1.0.0</span>
          </div>
          <span>Offline Ready</span>
        </div>
      )}
    </aside>
  )
}
