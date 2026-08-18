import React, { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ReceiptText,
  Clock,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useExpense } from '../context/ExpenseContext'
import CategoryIcon from '../components/common/CategoryIcon'

export default function DashboardPage() {
  const { onOpenAddModal, onOpenEditModal } = useOutletContext()
  const {
    metrics,
    monthlyStats,
    categoryStats,
    transactions,
    deleteTransaction,
    formatAmount,
    getCategory,
    currentMonthBudgets,
    currency,
  } = useExpense()

  // Quick Inline Add state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickType, setQuickType] = useState('expense')
  const { categories, addTransaction } = useExpense()

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!quickTitle.trim() || !quickAmount || Number(quickAmount) <= 0) return

    const defaultCat = categories.find((c) => c.type === quickType) || categories[0]
    addTransaction({
      title: quickTitle.trim(),
      amount: parseFloat(quickAmount),
      type: quickType,
      categoryId: defaultCat?.id || 'cat_misc',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      tags: ['Quick Add'],
    })

    setQuickTitle('')
    setQuickAmount('')
  }

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6)

  // Exceeded budgets warning
  const exceededBudgets = currentMonthBudgets.filter((b) => b.status === 'exceeded')

  // Top 5 Expense Categories for Donut Chart
  const topExpenseCategories = categoryStats.expenses.slice(0, 5)
  const otherExpenseTotal = categoryStats.expenses
    .slice(5)
    .reduce((acc, curr) => acc + curr.total, 0)

  const donutData = [...topExpenseCategories]
  if (otherExpenseTotal > 0) {
    donutData.push({
      categoryId: 'other',
      name: 'Other Categories',
      color: '#64748b',
      total: otherExpenseTotal,
      percentage: ((otherExpenseTotal / (metrics.totalExpense || 1)) * 100).toFixed(1),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Over-Budget Alert Banner if any */}
      {exceededBudgets.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--expense-light)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="var(--expense)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--expense)', fontSize: '0.95rem' }}>
                Budget Limit Exceeded in {exceededBudgets.length} {exceededBudgets.length === 1 ? 'Category' : 'Categories'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {exceededBudgets.map((b) => `${b.name} (${formatAmount(b.spent)} / ${formatAmount(b.budget)})`).join(', ')}
              </div>
            </div>
          </div>
          <Link to="/budgets" className="btn btn-sm btn-danger">
            Manage Budgets
          </Link>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="stat-grid">
        {/* Net Balance */}
        <div className="stat-card balance">
          <div className="stat-top">
            <span className="stat-label">Net Balance</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: metrics.netBalance >= 0 ? 'var(--text-primary)' : 'var(--expense)' }}>
            {formatAmount(metrics.netBalance)}
          </div>
          <div className="stat-meta">
            <span className={`stat-trend ${metrics.netBalance >= 0 ? 'positive' : 'negative'}`}>
              {metrics.netBalance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {metrics.savingsRate.toFixed(1)}% savings rate
            </span>
            <span>all time</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="stat-card income">
          <div className="stat-top">
            <span className="stat-label">Total Income</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value amount-income">
            +{formatAmount(metrics.totalIncome)}
          </div>
          <div className="stat-meta">
            <span className="stat-trend positive">
              <ArrowUpRight size={14} />
              Active
            </span>
            <span>from {transactions.filter((t) => t.type === 'income').length} deposits</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="stat-card expense">
          <div className="stat-top">
            <span className="stat-label">Total Expenses</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-value amount-expense">
            -{formatAmount(metrics.totalExpense)}
          </div>
          <div className="stat-meta">
            <span className="stat-trend negative">
              <ArrowDownRight size={14} />
              Outflow
            </span>
            <span>across {transactions.filter((t) => t.type === 'expense').length} payments</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="stat-card savings">
          <div className="stat-top">
            <span className="stat-label">Savings Health</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <div className="stat-meta">
            <div className="progress-bar-container" style={{ flex: 1, height: 6 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(metrics.savingsRate, 100)}%`,
                  backgroundColor: 'var(--info)',
                }}
              />
            </div>
            <span>target &gt; 20%</span>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ⚡ Quick Record:
          </span>
        </div>

        <form
          onSubmit={handleQuickAdd}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <div className="tab-group" style={{ padding: '0.15rem' }}>
            <button
              type="button"
              onClick={() => setQuickType('expense')}
              className={`tab-btn ${quickType === 'expense' ? 'active' : ''}`}
              style={{ color: quickType === 'expense' ? 'var(--expense)' : undefined }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setQuickType('income')}
              className={`tab-btn ${quickType === 'income' ? 'active' : ''}`}
              style={{ color: quickType === 'income' ? 'var(--income)' : undefined }}
            >
              Income
            </button>
          </div>

          <input
            type="text"
            placeholder="Title / Merchant (e.g. Coffee)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="form-input"
            style={{ width: '220px', padding: '0.45rem 0.75rem' }}
          />

          <input
            type="number"
            step="any"
            placeholder={`Amount (${currency.symbol})`}
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            className="form-input"
            style={{ width: '130px', padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)' }}
          />

          <button
            type="submit"
            className={`btn ${quickType === 'income' ? 'btn-success' : 'btn-danger'} btn-sm`}
            disabled={!quickTitle || !quickAmount}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Main Charts & Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Cash Flow Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Cash Flow & Monthly Trends</h2>
              <p className="card-subtitle">Comparison of Income vs Expenses over past months</p>
            </div>
            <Link to="/analytics" className="btn btn-secondary btn-sm">
              <span>Full Analytics</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="shortLabel" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                    formatter={(value) => [formatAmount(value), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No transaction data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Expense Donut */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Expense Distribution</h2>
              <p className="card-subtitle">Spending by category</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 180, position: 'relative' }}>
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                    formatter={(val) => [formatAmount(val), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No expenses logged yet.
              </div>
            )}
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {donutData.slice(0, 4).map((item) => (
              <div
                key={item.categoryId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatAmount(item.total)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <ReceiptText size={20} color="var(--primary)" />
              <span>Recent Transactions</span>
            </h2>
            <p className="card-subtitle">Showing latest records from your ledger</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => onOpenAddModal('expense')} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Tags</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No transactions found. Click "Add Transaction" to start tracking!
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const cat = getCategory(tx.categoryId)
                  const isIncome = tx.type === 'income'
                  return (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>{tx.date}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tx.title}
                        </div>
                        {tx.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: cat.color + '20',
                            color: cat.color,
                            border: `1px solid ${cat.color}35`,
                          }}
                        >
                          <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                          <span>{cat.name}</span>
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {tx.paymentMethod || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {(tx.tags || []).slice(0, 2).map((t, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={isIncome ? 'amount-income' : 'amount-expense'} style={{ fontSize: '0.95rem' }}>
                          {isIncome ? '+' : '-'}{formatAmount(tx.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--expense)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
