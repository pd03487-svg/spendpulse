import React, { useState, useEffect } from 'react'
import { X, Palette, DollarSign, Target } from 'lucide-react'
import { useExpense } from '../../context/ExpenseContext'
import CategoryIcon from '../common/CategoryIcon'

const AVAILABLE_ICONS = [
  'Home', 'ShoppingCart', 'Utensils', 'Car', 'Zap', 'Film', 'HeartPulse',
  'ShoppingBag', 'GraduationCap', 'Plane', 'Repeat', 'Tag', 'Briefcase',
  'Laptop', 'TrendingUp', 'Building', 'Gift', 'PlusCircle', 'Coffee',
  'Smartphone', 'Book', 'Music', 'Dumbbell', 'Shield', 'Smile'
]

const PALETTE_COLORS = [
  '#f43f5e', '#f97316', '#fb923c', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#38bdf8', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#64748b'
]

export default function CategoryModal({ isOpen, onClose, initialData = null, defaultType = 'expense' }) {
  const { addCategory, editCategory, currency } = useExpense()

  const [name, setName] = useState('')
  const [type, setType] = useState(defaultType)
  const [color, setColor] = useState(PALETTE_COLORS[0])
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0])
  const [budget, setBudget] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setType(initialData.type || 'expense')
      setColor(initialData.color || PALETTE_COLORS[0])
      setIcon(initialData.icon || AVAILABLE_ICONS[0])
      setBudget(initialData.budget ? String(initialData.budget) : '')
    } else {
      setName('')
      setType(defaultType)
      setColor(PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)])
      setIcon(AVAILABLE_ICONS[0])
      setBudget('')
    }
    setErrors({})
  }, [initialData, defaultType, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Category name is required'
    if (budget && isNaN(Number(budget))) {
      newErrors.budget = 'Budget must be a valid number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: name.trim(),
      type,
      color,
      icon,
      budget: budget ? parseFloat(budget) : 0,
    }

    if (initialData && initialData.id) {
      editCategory(initialData.id, payload)
    } else {
      addCategory(payload)
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
                backgroundColor: color + '25',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIcon name={icon} size={18} color={color} />
            </span>
            <h2 className="modal-title">
              {initialData ? 'Edit Category' : 'Create Custom Category'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category Type */}
            <div className="form-group">
              <label className="form-label">Category Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Expense Category
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`btn ${type === 'income' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  Income Category
                </button>
              </div>
            </div>

            {/* Category Name */}
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Pet Care, Gaming, Side Hustle"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ borderColor: errors.name ? 'var(--expense)' : undefined }}
                autoFocus
              />
              {errors.name && <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>

            {/* Monthly Budget (for expense categories) */}
            {type === 'expense' && (
              <div className="form-group">
                <label className="form-label">
                  Monthly Budget Limit ({currency.symbol})
                </label>
                <div className="input-with-icon">
                  <Target size={16} />
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 350.00 (Optional)"
                    className="form-input"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{ borderColor: errors.budget ? 'var(--expense)' : undefined }}
                  />
                </div>
                {errors.budget && (
                  <span style={{ color: 'var(--expense)', fontSize: '0.75rem' }}>{errors.budget}</span>
                )}
              </div>
            )}

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Select Icon</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.4rem',
                  maxHeight: 120,
                  overflowY: 'auto',
                  padding: '0.5rem',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: icon === ic ? color + '30' : 'transparent',
                      border: icon === ic ? `2px solid ${color}` : '1px solid transparent',
                      color: icon === ic ? color : 'var(--text-secondary)',
                    }}
                  >
                    <CategoryIcon name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="form-group">
              <label className="form-label">Category Color Accent</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform var(--transition-fast)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
