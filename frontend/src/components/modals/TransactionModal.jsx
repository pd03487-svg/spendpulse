import React, { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Calendar, Tag, CreditCard, AlignLeft, Repeat, DollarSign } from 'lucide-react'
import { useExpense } from '../../context/ExpenseContext'
import CategoryIcon from '../common/CategoryIcon'

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'UPI / Direct',
  'Cash',
  'PayPal / Digital Wallet',
  'Cryptocurrency',
  'Check',
]

export default function TransactionModal({ isOpen, onClose, initialData = null, defaultType = 'expense' }) {
  const { categories, addTransaction, editTransaction, currency } = useExpense()

  const [type, setType] = useState(defaultType)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [errors, setErrors] = useState({})

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense')
      setTitle(initialData.title || '')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setCategoryId(initialData.categoryId || '')
      setDate(initialData.date || new Date().toISOString().split('T')[0])
      setPaymentMethod(initialData.paymentMethod || PAYMENT_METHODS[0])
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''))
      setNotes(initialData.notes || '')
      setRecurring(!!initialData.recurring)
    } else {
      setType(defaultType)
      setTitle('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setPaymentMethod(PAYMENT_METHODS[0])
      setTags('')
      setNotes('')
      setRecurring(false)
    }
    setErrors({})
  }, [initialData, defaultType, isOpen])

  // Select first category when type switches if currently selected category doesn't match
  useEffect(() => {
    if (availableCategories.length > 0) {
      const match = availableCategories.find((c) => c.id === categoryId)
      if (!match) {
        setCategoryId(availableCategories[0].id)
      }
    }
  }, [type, availableCategories, categoryId])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Title / description is required'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    }
    if (!categoryId) newErrors.categoryId = 'Category selection is required'
    if (!date) newErrors.date = 'Date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      categoryId,
      date,
      paymentMethod,
      tags: tagArray,
      notes: notes.trim(),
      recurring,
    }

    if (initialData && initialData.id) {
      editTransaction(initialData.id, payload)
    } else {
      addTransaction(payload)
    }

    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: type === 'income' ? 'var(--income-light)' : 'var(--expense-light)',
                color: type === 'income' ? 'var(--income)' : 'var(--expense)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </span>
            <h2 className="modal-title">
              {initialData ? 'Edit Transaction' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: type === 'expense' ? 'var(--expense)' : 'var(--bg-tertiary)',
                  color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (type === 'expense' ? 'transparent' : 'var(--border-subtle)'),
                }}
              >
                <TrendingDown size={16} />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: type === 'income' ? 'var(--income)' : 'var(--bg-tertiary)',
                  color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (type === 'income' ? 'transparent' : 'var(--border-subtle)'),
                }}
              >
                <TrendingUp size={16} />
                <span>Income</span>
              </button>
            </div>

            {/* Amount Field */}
            <div className="form-group">
              <label className="form-label">
                Amount ({currency.code} - {currency.symbol}) *
              </label>
              <div className="input-with-icon">
                <DollarSign size={18} />
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="form-input"
                  style={{
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    borderColor: errors.amount ? 'var(--expense)' : undefined,
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              {errors.amount && <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.amount}</span>}
            </div>

            {/* Title / Description */}
            <div className="form-group">
              <label className="form-label">Description / Merchant / Source *</label>
              <input
                type="text"
                placeholder={type === 'income' ? 'e.g. Consulting Invoice #102' : 'e.g. Whole Foods Groceries'}
                className="form-input"
                style={{ borderColor: errors.title ? 'var(--expense)' : undefined }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.title}</span>}
            </div>

            {/* Category & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ borderColor: errors.categoryId ? 'var(--expense)' : undefined }}
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.categoryId}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <div className="input-with-icon">
                  <Calendar size={16} />
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ borderColor: errors.date ? 'var(--expense)' : undefined }}
                  />
                </div>
                {errors.date && <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.date}</span>}
              </div>
            </div>

            {/* Payment Method & Tags Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="input-with-icon">
                  <CreditCard size={16} />
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <div className="input-with-icon">
                  <Tag size={16} />
                  <input
                    type="text"
                    placeholder="Work, Tax, Subscription"
                    className="form-input"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes / Memo</label>
              <textarea
                placeholder="Add receipt details, invoice reference or context..."
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Recurring Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 0.8rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.5rem',
              }}
            >
              <input
                type="checkbox"
                id="recurring-toggle"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label
                htmlFor="recurring-toggle"
                style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Repeat size={14} color="var(--primary)" />
                <span>Mark as regular / monthly recurring item</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${type === 'income' ? 'btn-success' : 'btn-danger'}`}
            >
              {initialData ? 'Update Record' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
