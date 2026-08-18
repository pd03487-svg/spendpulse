import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Trash2,
  Calendar,
  CreditCard,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Square,
  Copy,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import CategoryIcon from '../components/common/CategoryIcon'

export default function TransactionsPage() {
  const { onOpenAddModal, onOpenEditModal } = useOutletContext()
  const {
    transactions,
    categories,
    deleteTransaction,
    deleteMultipleTransactions,
    addTransaction,
    getCategory,
    formatAmount,
    exportToCSV,
    generatePDFReport,
    currency,
  } = useExpense()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'this_month', 'last_month', 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date_desc') // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc'
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const currentMonthKey = now.toISOString().substring(0, 7)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false

      // Date preset filter
      if (dateFilter === 'this_month' && !tx.date.startsWith(currentMonthKey)) return false
      if (dateFilter === 'last_month' && !tx.date.startsWith(lastMonthKey)) return false
      if (dateFilter === 'custom') {
        if (startDate && tx.date < startDate) return false
        if (endDate && tx.date > endDate) return false
      }

      // Keyword search (title, notes, tags, payment method)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const titleMatch = (tx.title || '').toLowerCase().includes(query)
        const notesMatch = (tx.notes || '').toLowerCase().includes(query)
        const methodMatch = (tx.paymentMethod || '').toLowerCase().includes(query)
        const tagMatch = (tx.tags || []).some((t) => t.toLowerCase().includes(query))
        const categoryName = getCategory(tx.categoryId).name.toLowerCase()
        const catMatch = categoryName.includes(query)
        if (!titleMatch && !notesMatch && !methodMatch && !tagMatch && !catMatch) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount_desc') return b.amount - a.amount
      if (sortBy === 'amount_asc') return a.amount - b.amount
      return 0
    })
  }, [transactions, typeFilter, categoryFilter, dateFilter, startDate, endDate, searchTerm, sortBy, getCategory])

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedTransactions.map((t) => t.id)))
    }
  }

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (window.confirm(`Delete ${selectedIds.size} selected transaction(s)?`)) {
      deleteMultipleTransactions(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const handleDuplicate = (tx) => {
    const duplicated = {
      ...tx,
      id: undefined,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
    }
    addTransaction(duplicated)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setDateFilter('all')
    setStartDate('')
    setEndDate('')
    setSortBy('date_desc')
    setCurrentPage(1)
  }

  // Summary of current filtered view
  const filteredSummary = useMemo(() => {
    let inc = 0
    let exp = 0
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount
      else exp += t.amount
    })
    return { income: inc, expense: exp, net: inc - exp, count: filteredTransactions.length }
  }, [filteredTransactions])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Header */}
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
            Transactions Management
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredTransactions.length} records • Filtered Net: {filteredSummary.net >= 0 ? '+' : ''}{formatAmount(filteredSummary.net)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => exportToCSV(filteredTransactions)} className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={15} color="var(--income)" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => generatePDFReport(filteredTransactions)} className="btn btn-secondary btn-sm">
            <FileText size={15} color="var(--primary)" />
            <span>Export PDF</span>
          </button>
          <button onClick={() => onOpenAddModal('income')} className="btn btn-success btn-sm">
            <Plus size={15} />
            <span>Add Income</span>
          </button>
          <button onClick={() => onOpenAddModal('expense')} className="btn btn-danger btn-sm">
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Control Center Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Keyword Search */}
          <div className="input-with-icon">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search description, tag, memo..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Types (Income & Expenses)</option>
            <option value="expense">Expenses Only (-)</option>
            <option value="income">Income Only (+)</option>
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Time Dates</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {/* Sort By */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: Highest First</option>
            <option value="amount_asc">Amount: Lowest First</option>
          </select>
        </div>

        {/* Custom Date Range Pickers if active */}
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Calendar size={16} />
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
            </div>
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Calendar size={16} />
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
        )}

        {/* Active Filter Tags & Reset */}
        {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
            {searchTerm && <span className="badge badge-neutral">Keyword: {searchTerm}</span>}
            {typeFilter !== 'all' && <span className="badge badge-neutral">Type: {typeFilter}</span>}
            {categoryFilter !== 'all' && <span className="badge badge-neutral">Category: {getCategory(categoryFilter).name}</span>}
            {dateFilter !== 'all' && <span className="badge badge-neutral">Date: {dateFilter}</span>}
            <button
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.2rem' }}
            >
              <X size={12} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Bar if items selected */}
      {selectedIds.size > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            {selectedIds.size} transaction(s) selected
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const selectedList = transactions.filter((t) => selectedIds.has(t.id))
                exportToCSV(selectedList)
              }}
              className="btn btn-secondary btn-sm"
            >
              <FileSpreadsheet size={14} />
              <span>Export Selected</span>
            </button>
            <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Transactions Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <button onClick={handleSelectAll} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    {selectedIds.size > 0 && selectedIds.size === paginatedTransactions.length ? (
                      <CheckSquare size={16} color="var(--primary)" />
                    ) : (
                      <Square size={16} color="var(--text-muted)" />
                    )}
                  </button>
                </th>
                <th>Date</th>
                <th>Description & Memo</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Tags</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No matching transactions found. Try adjusting your search criteria or add a new record.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const cat = getCategory(tx.categoryId)
                  const isIncome = tx.type === 'income'
                  const isSelected = selectedIds.has(tx.id)

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        backgroundColor: isSelected ? 'var(--primary-light)' : undefined,
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleSelect(tx.id)}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} color="var(--primary)" />
                          ) : (
                            <Square size={16} color="var(--text-muted)" />
                          )}
                        </button>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>{tx.date}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tx.title}
                          {tx.recurring && (
                            <span
                              className="badge badge-neutral"
                              style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}
                              title="Monthly Recurring"
                            >
                              🔄 Recurring
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
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
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {tx.paymentMethod || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {(tx.tags || []).map((t, idx) => (
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
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(tx)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--expense)' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
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

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
