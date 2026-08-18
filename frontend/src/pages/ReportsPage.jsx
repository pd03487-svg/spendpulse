import React, { useState, useMemo } from 'react'
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Database,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import CategoryIcon from '../components/common/CategoryIcon'

export default function ReportsPage() {
  const {
    transactions,
    categories,
    getCategory,
    formatAmount,
    currency,
    exportToCSV,
    exportToJSON,
    generatePDFReport,
  } = useExpense()

  // Report filter options
  const [reportPeriod, setReportPeriod] = useState('all') // 'all', 'this_month', 'last_month', 'this_year', 'custom'
  const [reportType, setReportType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Filtered dataset for reporting
  const reportTransactions = useMemo(() => {
    const now = new Date()
    const currentMonthKey = now.toISOString().substring(0, 7)
    const currentYearKey = String(now.getFullYear())

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    return transactions.filter((tx) => {
      if (reportType !== 'all' && tx.type !== reportType) return false
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false

      if (reportPeriod === 'this_month' && !tx.date.startsWith(currentMonthKey)) return false
      if (reportPeriod === 'last_month' && !tx.date.startsWith(lastMonthKey)) return false
      if (reportPeriod === 'this_year' && !tx.date.startsWith(currentYearKey)) return false
      if (reportPeriod === 'custom') {
        if (customStart && tx.date < customStart) return false
        if (customEnd && tx.date > customEnd) return false
      }

      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, reportPeriod, reportType, selectedCategory, customStart, customEnd])

  // Calculated Report Summary KPIs
  const reportSummary = useMemo(() => {
    let income = 0
    let expense = 0
    const catMap = {}

    reportTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount
      } else {
        expense += tx.amount
      }

      const cat = getCategory(tx.categoryId)
      if (!catMap[tx.categoryId]) {
        catMap[tx.categoryId] = {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          type: tx.type,
          total: 0,
          count: 0,
        }
      }
      catMap[tx.categoryId].total += tx.amount
      catMap[tx.categoryId].count += 1
    })

    const net = income - expense
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

    return {
      income,
      expense,
      net,
      savingsRate: Math.max(0, savingsRate),
      count: reportTransactions.length,
      categoryList: Object.values(catMap).sort((a, b) => b.total - a.total),
    }
  }, [reportTransactions, getCategory])

  const handleDownloadPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      generatePDFReport(reportTransactions, 'SpendPulse Financial Report')
      setIsExporting(false)
    }, 150)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div
        className="no-print"
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
            Financial Report Studio
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Generate executive summaries, export formatted PDF statements, or download CSV raw spreadsheets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm" disabled={isExporting}>
            <FileText size={15} />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Statement'}</span>
          </button>
          <button onClick={() => exportToCSV(reportTransactions)} className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={15} color="var(--income)" />
            <span>Export CSV</span>
          </button>
          <button onClick={exportToJSON} className="btn btn-secondary btn-sm">
            <Database size={15} color="var(--info)" />
            <span>JSON Backup</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Configuration & Filters Bar */}
      <div className="card no-print" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--primary)" />
          <span>Statement Filter Criteria</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Period Selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Report Period</label>
            <select
              className="form-select"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="all">All Time (Full History)</option>
              <option value="this_month">Current Calendar Month</option>
              <option value="last_month">Previous Month</option>
              <option value="this_year">Current Fiscal Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Type Selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Transaction Type</label>
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="all">Both Income & Expenses</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Selector */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category Scope</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reportPeriod === 'custom' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Calendar size={16} />
              <input
                type="date"
                className="form-input"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                placeholder="From Date"
              />
            </div>
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Calendar size={16} />
              <input
                type="date"
                className="form-input"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Statement Document Preview Container */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Document Header Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border-medium)',
            paddingBottom: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SpendPulse Financial Statement
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Personal & Business Wealth Analytics Record
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong>Generated:</strong> {new Date().toLocaleDateString(currency.locale, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div>
              <strong>Currency:</strong> {currency.name} ({currency.code} - {currency.symbol})
            </div>
            <div>
              <strong>Scope:</strong> {reportTransactions.length} itemized records
            </div>
          </div>
        </div>

        {/* Executive Summary Metric Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL INFLOW</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--income)', fontFamily: 'var(--font-mono)' }}>
              +{formatAmount(reportSummary.income)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL OUTFLOW</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--expense)', fontFamily: 'var(--font-mono)' }}>
              -{formatAmount(reportSummary.expense)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>NET BALANCE</div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: reportSummary.net >= 0 ? 'var(--text-primary)' : 'var(--expense)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {reportSummary.net >= 0 ? '+' : ''}{formatAmount(reportSummary.net)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAVINGS RATE</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--info)', fontFamily: 'var(--font-mono)' }}>
              {reportSummary.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Category Breakdown Summary */}
        {reportSummary.categoryList.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Category Volume Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {reportSummary.categoryList.slice(0, 6).map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c.color }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatAmount(c.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itemized Transaction Records Table */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Itemized Transaction Records ({reportTransactions.length})
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No records match the current filter options.
                    </td>
                  </tr>
                ) : (
                  reportTransactions.map((tx) => {
                    const cat = getCategory(tx.categoryId)
                    const isIncome = tx.type === 'income'
                    return (
                      <tr key={tx.id}>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tx.date}</td>
                        <td>
                          <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.68rem' }}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          {tx.title}
                          {tx.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.notes}</div>}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{cat.name}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tx.paymentMethod || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }} className={isIncome ? 'amount-income' : 'amount-expense'}>
                          {isIncome ? '+' : '-'}{formatAmount(tx.amount)}
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
    </div>
  )
}
