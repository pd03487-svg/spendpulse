import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { useExpense } from '../context/ExpenseContext'
import CategoryIcon from '../components/common/CategoryIcon'

export default function AnalyticsPage() {
  const {
    monthlyStats,
    categoryStats,
    transactions,
    formatAmount,
    currency,
    categories,
    currentMonthBudgets,
  } = useExpense()

  const [timeRange, setTimeRange] = useState('all') // 'all', '6m', '3m'

  // Filtered monthly stats based on range
  const filteredMonthlyStats = useMemo(() => {
    if (timeRange === '3m') return monthlyStats.slice(-3)
    if (timeRange === '6m') return monthlyStats.slice(-6)
    return monthlyStats
  }, [monthlyStats, timeRange])

  // Daily Spending distribution across days 1 to 31
  const dailySpendingData = useMemo(() => {
    const dayMap = {}
    for (let i = 1; i <= 31; i++) {
      dayMap[i] = 0
    }

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const day = parseInt(tx.date.split('-')[2], 10)
        if (day >= 1 && day <= 31) {
          dayMap[day] += tx.amount
        }
      }
    })

    return Object.entries(dayMap).map(([day, amount]) => ({
      day: `Day ${day}`,
      dayNum: parseInt(day, 10),
      amount: Math.round(amount),
    }))
  }, [transactions])

  // Highest spending day
  const peakDay = useMemo(() => {
    let max = { day: 'N/A', amount: 0 }
    dailySpendingData.forEach((d) => {
      if (d.amount > max.amount) {
        max = d
      }
    })
    return max
  }, [dailySpendingData])

  // Budget vs Actual for Top Categories
  const budgetVsActualData = useMemo(() => {
    return currentMonthBudgets
      .filter((b) => b.budget > 0)
      .slice(0, 7)
      .map((b) => ({
        name: b.name,
        spent: b.spent,
        budget: b.budget,
        color: b.color,
      }))
  }, [currentMonthBudgets])

  // Summary Metrics for Analytics
  const analyticsSummary = useMemo(() => {
    const totalExp = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, c) => acc + c.amount, 0)
    const totalInc = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, c) => acc + c.amount, 0)

    const avgMonthlyExp = monthlyStats.length > 0 ? totalExp / monthlyStats.length : 0
    const avgMonthlyInc = monthlyStats.length > 0 ? totalInc / monthlyStats.length : 0
    const topCategory = categoryStats.expenses[0] || { name: 'None', total: 0, percentage: '0' }

    return {
      avgMonthlyExp,
      avgMonthlyInc,
      topCategory,
      avgDailyExp: totalExp / 90, // approx 90 days
    }
  }, [transactions, monthlyStats, categoryStats])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Range Switcher */}
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
            Financial Intelligence & Trends
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Deep dive into spending velocity, category distributions, and monthly cash flow
          </p>
        </div>

        <div className="tab-group">
          <button
            onClick={() => setTimeRange('all')}
            className={`tab-btn ${timeRange === 'all' ? 'active' : ''}`}
          >
            All History
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`tab-btn ${timeRange === '6m' ? 'active' : ''}`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange('3m')}
            className={`tab-btn ${timeRange === '3m' ? 'active' : ''}`}
          >
            Last 3 Months
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Avg. Monthly Income</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value amount-income">
            +{formatAmount(analyticsSummary.avgMonthlyInc)}
          </div>
          <div className="stat-meta">Based on {monthlyStats.length} active cycles</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Avg. Monthly Expense</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--expense-light)', color: 'var(--expense)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="stat-value amount-expense">
            -{formatAmount(analyticsSummary.avgMonthlyExp)}
          </div>
          <div className="stat-meta">Monthly outflow velocity</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Top Expense Category</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {analyticsSummary.topCategory.name}
          </div>
          <div className="stat-meta">
            <span className="badge badge-warning">{analyticsSummary.topCategory.percentage}% of all expenses</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Peak Spending Day</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {peakDay.day}
          </div>
          <div className="stat-meta">
            <span>Peak outflow: {formatAmount(peakDay.amount)}</span>
          </div>
        </div>
      </div>

      {/* Chart Row 1: Cash Flow Area Chart + Category Breakdown Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Monthly Cash Flow Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Monthly Cash Flow Growth</h3>
              <p className="card-subtitle">Income vs Outflow trajectory over time</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredMonthlyStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
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
                  formatter={(val) => [formatAmount(val), '']}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="income" name="Total Income" stroke="#10b981" strokeWidth={3} fill="url(#incGrad2)" />
                <Area type="monotone" dataKey="expense" name="Total Expense" stroke="#f43f5e" strokeWidth={3} fill="url(#expGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Expense Proportions</h3>
              <p className="card-subtitle">Breakdown by category</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats.expenses}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categoryStats.expenses.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem', maxHeight: 110, overflowY: 'auto' }}>
            {categoryStats.expenses.map((cat) => (
              <div key={cat.categoryId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Day of the Month Spending Patterns + Category Budget vs Actual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Day of Month Spending Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Day-of-Month Spending Heatmap</h3>
              <p className="card-subtitle">Outflow pattern across day 1 to 31 to spot recurring billing days</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="dayNum" stroke="var(--text-muted)" fontSize={10} interval={2} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(val) => [formatAmount(val), 'Total Outflow']}
                  labelFormatter={(lbl) => `Day ${lbl} of the month`}
                />
                <Bar dataKey="amount" name="Spent" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Budget vs Actual Spending */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Budget vs. Actual Spending</h3>
              <p className="card-subtitle">Current month limit utilization by category</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickFormatter={(v) => `${currency.symbol}${v}`} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(val) => [formatAmount(val), '']}
                />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="spent" name="Spent" fill="var(--expense)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="budget" name="Budget Limit" fill="var(--info)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Full Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Detailed Category Distribution Table</h3>
            <p className="card-subtitle">Comprehensive overview of all income & expense categories</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Transaction Count</th>
                <th style={{ textAlign: 'right' }}>Total Volume</th>
                <th style={{ textAlign: 'right' }}>% Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.expenses.map((c) => (
                <tr key={c.categoryId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: c.color + '20',
                          color: c.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CategoryIcon name={c.icon} size={15} color={c.color} />
                      </span>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-expense">Expense</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.count} transactions</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className="amount-expense">
                    -{formatAmount(c.total)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{c.percentage}%</td>
                </tr>
              ))}
              {categoryStats.income.map((c) => (
                <tr key={c.categoryId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: c.color + '20',
                          color: c.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CategoryIcon name={c.icon} size={15} color={c.color} />
                      </span>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-income">Income</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.count} deposits</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className="amount-income">
                    +{formatAmount(c.total)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{c.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
