import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import CategoryIcon from '../components/common/CategoryIcon'

export default function BudgetsPage() {
  const { onOpenCategoryModal } = useOutletContext()
  const {
    categories,
    deleteCategory,
    updateBudget,
    currentMonthBudgets,
    formatAmount,
    currency,
  } = useExpense()

  const [editingBudgetId, setEditingBudgetId] = useState(null)
  const [tempBudgetVal, setTempBudgetVal] = useState('')
  const [activeTab, setActiveTab] = useState('budgets') // 'budgets', 'categories'

  // Aggregated monthly budget metrics
  const totalAllocatedBudget = currentMonthBudgets.reduce((acc, b) => acc + (b.budget || 0), 0)
  const totalBudgetSpent = currentMonthBudgets.reduce((acc, b) => acc + (b.spent || 0), 0)
  const overallPercentage = totalAllocatedBudget > 0 ? (totalBudgetSpent / totalAllocatedBudget) * 100 : 0
  const overallRemaining = totalAllocatedBudget - totalBudgetSpent

  const handleStartEditBudget = (cat) => {
    setEditingBudgetId(cat.id)
    setTempBudgetVal(cat.budget ? String(cat.budget) : '0')
  }

  const handleSaveBudget = (catId) => {
    updateBudget(catId, parseFloat(tempBudgetVal) || 0)
    setEditingBudgetId(null)
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Category Budgets & Limits
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Set spending targets per category and avoid month-end budget overruns
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="tab-group">
            <button
              onClick={() => setActiveTab('budgets')}
              className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
            >
              Monthly Budgets
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            >
              Manage Categories
            </button>
          </div>

          <button onClick={() => onOpenCategoryModal(null, 'expense')} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {activeTab === 'budgets' ? (
        <>
          {/* Monthly Budget High-Level Overview */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Target size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Monthly Budget Health</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Current calendar month tracking across all budgeted categories
                </p>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BUDGET</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatAmount(totalAllocatedBudget)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SPENT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--expense)' }}>
                    {formatAmount(totalBudgetSpent)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REMAINING</div>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: overallRemaining >= 0 ? 'var(--income)' : 'var(--expense)',
                    }}
                  >
                    {overallRemaining >= 0 ? '+' : ''}{formatAmount(overallRemaining)}
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Budget Utilized: {overallPercentage.toFixed(1)}%</span>
                <span style={{ fontWeight: 600, color: overallRemaining >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                  {overallRemaining >= 0 ? `${formatAmount(overallRemaining)} left` : `${formatAmount(Math.abs(overallRemaining))} OVER LIMIT`}
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: 10 }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(overallPercentage, 100)}%`,
                    backgroundColor:
                      overallPercentage > 100
                        ? 'var(--expense)'
                        : overallPercentage >= 80
                        ? 'var(--warning)'
                        : 'var(--income)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category Budget Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {currentMonthBudgets.map((cat) => {
              const isEditing = editingBudgetId === cat.id
              const hasBudget = cat.budget > 0

              let badgeStyle = 'badge-neutral'
              let badgeText = 'No Budget Limit'
              let barColor = 'var(--primary)'

              if (hasBudget) {
                if (cat.status === 'exceeded') {
                  badgeStyle = 'badge-expense'
                  badgeText = 'Exceeded Limit'
                  barColor = 'var(--expense)'
                } else if (cat.status === 'warning') {
                  badgeStyle = 'badge-warning'
                  badgeText = 'Near Limit (>80%)'
                  barColor = 'var(--warning)'
                } else {
                  badgeStyle = 'badge-income'
                  badgeText = 'On Track'
                  barColor = 'var(--income)'
                }
              }

              return (
                <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: cat.color + '25',
                          color: cat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</div>
                        <span className={`badge ${badgeStyle}`} style={{ fontSize: '0.7rem' }}>
                          {badgeText}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartEditBudget(cat)}
                      className="btn-icon"
                      title="Set / Edit Budget"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>

                  {/* Spending vs Limit Numbers */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {formatAmount(cat.spent)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        of {hasBudget ? formatAmount(cat.budget) : 'No Cap'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container" style={{ height: 8 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${hasBudget ? Math.min(cat.percentage, 100) : 0}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                      <span>{hasBudget ? `${cat.rawPercentage.toFixed(0)}% used` : 'Unbudgeted'}</span>
                      {hasBudget && (
                        <span style={{ fontWeight: 600, color: cat.remaining >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                          {cat.remaining >= 0 ? `${formatAmount(cat.remaining)} remaining` : `${formatAmount(Math.abs(cat.remaining))} over`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline Edit Input if active */}
                  {isEditing && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <input
                        type="number"
                        step="any"
                        placeholder="Limit (e.g. 500)"
                        value={tempBudgetVal}
                        onChange={(e) => setTempBudgetVal(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        autoFocus
                      />
                      <button onClick={() => handleSaveBudget(cat.id)} className="btn btn-primary btn-sm">
                        Save
                      </button>
                      <button onClick={() => setEditingBudgetId(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Categories Manager Tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Expense Categories */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title" style={{ color: 'var(--expense)' }}>
                  <TrendingDown size={18} />
                  <span>Expense Categories ({expenseCategories.length})</span>
                </h3>
                <p className="card-subtitle">Categories used for tracking outgoing payments</p>
              </div>
              <button
                onClick={() => onOpenCategoryModal(null, 'expense')}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {expenseCategories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: c.color + '20',
                        color: c.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CategoryIcon name={c.icon} size={16} color={c.color} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Budget: {c.budget > 0 ? formatAmount(c.budget) : 'None'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => onOpenCategoryModal(c, 'expense')}
                      className="btn-icon"
                      style={{ width: 30, height: 30 }}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="btn-icon"
                      style={{ width: 30, height: 30, color: 'var(--expense)' }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title" style={{ color: 'var(--income)' }}>
                  <TrendingUp size={18} />
                  <span>Income Categories ({incomeCategories.length})</span>
                </h3>
                <p className="card-subtitle">Categories used for tracking revenue & deposits</p>
              </div>
              <button
                onClick={() => onOpenCategoryModal(null, 'income')}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {incomeCategories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: c.color + '20',
                        color: c.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CategoryIcon name={c.icon} size={16} color={c.color} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deposit Channel</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => onOpenCategoryModal(c, 'income')}
                      className="btn-icon"
                      style={{ width: 30, height: 30 }}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="btn-icon"
                      style={{ width: 30, height: 30, color: 'var(--expense)' }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
