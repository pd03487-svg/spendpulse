import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ExpenseContext = createContext(null)

// Default Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
]

// Default Categories with pre-configured colors, icons, and monthly budgets
export const DEFAULT_CATEGORIES = [
  // Income Categories
  { id: 'cat_salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', budget: 0 },
  { id: 'cat_freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#06b6d4', budget: 0 },
  { id: 'cat_investments', name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', budget: 0 },
  { id: 'cat_business', name: 'Business Income', type: 'income', icon: 'Building', color: '#3b82f6', budget: 0 },
  { id: 'cat_gifts', name: 'Gifts & Rewards', type: 'income', icon: 'Gift', color: '#ec4899', budget: 0 },
  { id: 'cat_other_income', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#14b8a6', budget: 0 },

  // Expense Categories
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#f43f5e', budget: 1500 },
  { id: 'cat_groceries', name: 'Groceries & Supermarket', type: 'expense', icon: 'ShoppingCart', color: '#f97316', budget: 500 },
  { id: 'cat_dining', name: 'Dining Out & Cafes', type: 'expense', icon: 'Utensils', color: '#fb923c', budget: 350 },
  { id: 'cat_transport', name: 'Transportation & Fuel', type: 'expense', icon: 'Car', color: '#eab308', budget: 250 },
  { id: 'cat_utilities', name: 'Utilities & Internet', type: 'expense', icon: 'Zap', color: '#84cc16', budget: 200 },
  { id: 'cat_entertainment', name: 'Entertainment & Gaming', type: 'expense', icon: 'Film', color: '#a855f7', budget: 180 },
  { id: 'cat_health', name: 'Healthcare & Fitness', type: 'expense', icon: 'HeartPulse', color: '#06b6d4', budget: 150 },
  { id: 'cat_shopping', name: 'Shopping & Apparel', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', budget: 300 },
  { id: 'cat_education', name: 'Education & Courses', type: 'expense', icon: 'GraduationCap', color: '#6366f1', budget: 120 },
  { id: 'cat_travel', name: 'Travel & Vacations', type: 'expense', icon: 'Plane', color: '#38bdf8', budget: 400 },
  { id: 'cat_subscriptions', name: 'Subscriptions & Software', type: 'expense', icon: 'Repeat', color: '#d946ef', budget: 80 },
  { id: 'cat_misc', name: 'Miscellaneous', type: 'expense', icon: 'Tag', color: '#64748b', budget: 100 },
]

// Generate realistic sample transactions spanning the current and previous 3 months
export const generateDemoTransactions = () => {
  const now = new Date()
  const transactions = []
  let idCounter = 1

  const makeId = () => `tx_${idCounter++}_${Date.now()}`

  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()

    const pad = (n) => String(n).padStart(2, '0')
    const formatD = (d) => `${year}-${pad(month + 1)}-${pad(d)}`

    // Income items
    transactions.push({
      id: makeId(),
      title: 'Monthly Tech Salary',
      amount: 4800,
      type: 'income',
      categoryId: 'cat_salary',
      date: formatD(1),
      paymentMethod: 'Bank Transfer',
      tags: ['Primary Job', 'Direct Deposit'],
      notes: 'Monthly corporate base pay',
      recurring: true,
    })

    transactions.push({
      id: makeId(),
      title: 'Freelance UI/UX Project',
      amount: monthOffset % 2 === 0 ? 1250 : 850,
      type: 'income',
      categoryId: 'cat_freelance',
      date: formatD(14),
      paymentMethod: 'UPI / Direct',
      tags: ['Design', 'Client'],
      notes: 'Mobile app UI redesign deliverable',
      recurring: false,
    })

    if (monthOffset === 1 || monthOffset === 3) {
      transactions.push({
        id: makeId(),
        title: 'Stock Dividend Payout',
        amount: 215,
        type: 'income',
        categoryId: 'cat_investments',
        date: formatD(22),
        paymentMethod: 'Bank Transfer',
        tags: ['Passive Income', 'Equities'],
        notes: 'Quarterly index fund dividend',
        recurring: true,
      })
    }

    // Expense items
    transactions.push({
      id: makeId(),
      title: 'Apartment Rent',
      amount: 1450,
      type: 'expense',
      categoryId: 'cat_housing',
      date: formatD(2),
      paymentMethod: 'Bank Transfer',
      tags: ['Fixed', 'Living'],
      notes: 'Monthly apartment lease',
      recurring: true,
    })

    transactions.push({
      id: makeId(),
      title: 'High-speed Fiber Internet & Power',
      amount: 175,
      type: 'expense',
      categoryId: 'cat_utilities',
      date: formatD(5),
      paymentMethod: 'Credit Card',
      tags: ['Bills'],
      notes: 'Electric & 1Gbps Fiber',
      recurring: true,
    })

    transactions.push({
      id: makeId(),
      title: 'Supermarket Groceries & Pantry',
      amount: 220 + (monthOffset * 15),
      type: 'expense',
      categoryId: 'cat_groceries',
      date: formatD(7),
      paymentMethod: 'Credit Card',
      tags: ['Food', 'Essentials'],
      notes: 'Weekly whole foods haul',
      recurring: false,
    })

    transactions.push({
      id: makeId(),
      title: 'Fine Dining & Bistro Dinner',
      amount: 140,
      type: 'expense',
      categoryId: 'cat_dining',
      date: formatD(11),
      paymentMethod: 'Credit Card',
      tags: ['Social', 'Weekend'],
      notes: 'Celebratory team dinner',
      recurring: false,
    })

    transactions.push({
      id: makeId(),
      title: 'Fuel & EV Charging',
      amount: 95,
      type: 'expense',
      categoryId: 'cat_transport',
      date: formatD(16),
      paymentMethod: 'Debit Card',
      tags: ['Commute'],
      notes: 'Full tank refill',
      recurring: false,
    })

    transactions.push({
      id: makeId(),
      title: 'Cloud & SaaS Subscriptions',
      amount: 65,
      type: 'expense',
      categoryId: 'cat_subscriptions',
      date: formatD(18),
      paymentMethod: 'Credit Card',
      tags: ['Software', 'Tools'],
      notes: 'GitHub, Spotify, OpenAI',
      recurring: true,
    })

    transactions.push({
      id: makeId(),
      title: 'Gym Membership & Supplements',
      amount: 110,
      type: 'expense',
      categoryId: 'cat_health',
      date: formatD(20),
      paymentMethod: 'Debit Card',
      tags: ['Wellness'],
      notes: 'Monthly pass & protein powder',
      recurring: true,
    })

    transactions.push({
      id: makeId(),
      title: 'Weekend Mid-Month Groceries',
      amount: 185,
      type: 'expense',
      categoryId: 'cat_groceries',
      date: formatD(21),
      paymentMethod: 'Credit Card',
      tags: ['Food'],
      notes: 'Pantry restocking',
      recurring: false,
    })

    transactions.push({
      id: makeId(),
      title: 'Cinema & Concert Tickets',
      amount: 90,
      type: 'expense',
      categoryId: 'cat_entertainment',
      date: formatD(25),
      paymentMethod: 'UPI / Direct',
      tags: ['Fun', 'Music'],
      notes: 'Live acoustic festival',
      recurring: false,
    })

    if (monthOffset === 0 || monthOffset === 2) {
      transactions.push({
        id: makeId(),
        title: 'New Wireless Headphones',
        amount: 180,
        type: 'expense',
        categoryId: 'cat_shopping',
        date: formatD(27),
        paymentMethod: 'Credit Card',
        tags: ['Electronics'],
        notes: 'Noise-canceling earphones',
        recurring: false,
      })
    }
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function ExpenseProvider({ children }) {
  // Theme state
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('spendpulse_theme') || 'dark'
  })

  // Currency state
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('spendpulse_currency')
    return saved ? JSON.parse(saved) : CURRENCIES[0]
  })

  // Categories state
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('spendpulse_categories')
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
  })

  // Transactions state
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('spendpulse_transactions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {
        console.error('Error parsing stored transactions', e)
      }
    }
    return generateDemoTransactions()
  })

  // Synchronize theme attribute to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('spendpulse_theme', theme)
  }, [theme])

  // Synchronize persistence
  useEffect(() => {
    localStorage.setItem('spendpulse_currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    localStorage.setItem('spendpulse_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('spendpulse_transactions', JSON.stringify(transactions))
  }, [transactions])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setCurrency = (currCode) => {
    const match = CURRENCIES.find((c) => c.code === currCode) || CURRENCIES[0]
    setCurrencyState(match)
  }

  // Format monetary value
  const formatAmount = (val, options = {}) => {
    const num = Number(val) || 0
    const formattedNum = num.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return options.hideSymbol ? formattedNum : `${currency.symbol}${formattedNum}`
  }

  // CRUD Actions: Transactions
  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount: Math.abs(Number(tx.amount)) || 0,
      date: tx.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(tx.tags) ? tx.tags : (tx.tags ? tx.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
    }
    setTransactions((prev) => [newTx, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
    return newTx
  }

  const editTransaction = (id, updatedFields) => {
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            amount: Math.abs(Number(updatedFields.amount ?? item.amount)),
            tags: Array.isArray(updatedFields.tags) 
              ? updatedFields.tags 
              : (updatedFields.tags ? updatedFields.tags.split(',').map(t => t.trim()).filter(Boolean) : item.tags),
          }
        }
        return item
      }).sort((a, b) => new Date(b.date) - new Date(a.date))
    )
  }

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
  }

  const deleteMultipleTransactions = (ids) => {
    const idSet = new Set(ids)
    setTransactions((prev) => prev.filter((item) => !idSet.has(item.id)))
  }

  // CRUD Actions: Categories
  const addCategory = (category) => {
    const newCat = {
      ...category,
      id: category.id || `cat_${Date.now()}`,
      budget: Number(category.budget) || 0,
    }
    setCategories((prev) => [...prev, newCat])
    return newCat
  }

  const editCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat))
    )
  }

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const updateBudget = (categoryId, newBudget) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, budget: Number(newBudget) || 0 } : cat
      )
    )
  }

  // Demo / Reset utilities
  const resetToDemoData = () => {
    setCategories(DEFAULT_CATEGORIES)
    setTransactions(generateDemoTransactions())
  }

  const clearAllData = () => {
    setTransactions([])
  }

  // Helper map for fast category lookup
  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((cat) => map.set(cat.id, cat))
    return map
  }, [categories])

  const getCategory = (catId) => {
    return categoryMap.get(catId) || {
      id: catId,
      name: 'Uncategorized',
      color: '#94a3b8',
      icon: 'Tag',
      type: 'expense',
      budget: 0,
    }
  }

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    let income = 0
    let expense = 0

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount
      } else {
        expense += tx.amount
      }
    })

    const netBalance = income - expense
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance,
      savingsRate: Math.max(0, savingsRate),
      transactionCount: transactions.length,
    }
  }, [transactions])

  // Monthly Aggregated Data (for trends and charts)
  const monthlyStats = useMemo(() => {
    const monthMap = {}

    // Group transactions by YYYY-MM
    transactions.forEach((tx) => {
      const monthKey = tx.date.substring(0, 7) // 'YYYY-MM'
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          monthKey,
          income: 0,
          expense: 0,
          savings: 0,
          count: 0,
        }
      }
      if (tx.type === 'income') {
        monthMap[monthKey].income += tx.amount
      } else {
        monthMap[monthKey].expense += tx.amount
      }
      monthMap[monthKey].count += 1
    })

    // Sort chronologically ascending
    const sortedKeys = Object.keys(monthMap).sort()
    return sortedKeys.map((key) => {
      const d = new Date(`${key}-01T00:00:00`)
      const label = d.toLocaleDateString(currency.locale, { month: 'short', year: 'numeric' })
      const shortLabel = d.toLocaleDateString(currency.locale, { month: 'short' })
      const item = monthMap[key]
      const savings = item.income - item.expense
      return {
        ...item,
        label,
        shortLabel,
        savings,
        savingsRate: item.income > 0 ? (savings / item.income) * 100 : 0,
      }
    })
  }, [transactions, currency.locale])

  // Category Breakdown for expenses and income
  const categoryStats = useMemo(() => {
    const expenseBreakdown = {}
    const incomeBreakdown = {}

    transactions.forEach((tx) => {
      const target = tx.type === 'income' ? incomeBreakdown : expenseBreakdown
      const cat = getCategory(tx.categoryId)
      if (!target[tx.categoryId]) {
        target[tx.categoryId] = {
          categoryId: tx.categoryId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          total: 0,
          count: 0,
          budget: cat.budget || 0,
        }
      }
      target[tx.categoryId].total += tx.amount
      target[tx.categoryId].count += 1
    })

    const expenseList = Object.values(expenseBreakdown).sort((a, b) => b.total - a.total)
    const incomeList = Object.values(incomeBreakdown).sort((a, b) => b.total - a.total)

    const totalExp = metrics.totalExpense || 1
    const expenseWithPercentages = expenseList.map((item) => ({
      ...item,
      percentage: ((item.total / totalExp) * 100).toFixed(1),
    }))

    const totalInc = metrics.totalIncome || 1
    const incomeWithPercentages = incomeList.map((item) => ({
      ...item,
      percentage: ((item.total / totalInc) * 100).toFixed(1),
    }))

    return {
      expenses: expenseWithPercentages,
      income: incomeWithPercentages,
    }
  }, [transactions, categoryMap, metrics])

  // Current Month's Budget Status
  const currentMonthBudgets = useMemo(() => {
    const currentMonthKey = new Date().toISOString().substring(0, 7)
    const currentMonthExpenses = {}

    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonthKey)) {
        currentMonthExpenses[tx.categoryId] = (currentMonthExpenses[tx.categoryId] || 0) + tx.amount
      }
    })

    const expenseCategories = categories.filter((c) => c.type === 'expense')
    return expenseCategories.map((cat) => {
      const spent = currentMonthExpenses[cat.id] || 0
      const budget = cat.budget || 0
      const percentage = budget > 0 ? (spent / budget) * 100 : 0
      const remaining = budget - spent

      let status = 'normal'
      if (budget > 0) {
        if (spent > budget) status = 'exceeded'
        else if (percentage >= 80) status = 'warning'
      }

      return {
        ...cat,
        spent,
        budget,
        percentage: Math.min(percentage, 100),
        rawPercentage: percentage,
        remaining,
        status,
      }
    }).sort((a, b) => (b.spent - a.spent))
  }, [categories, transactions])

  // Export Data Utilities
  const exportToCSV = (filteredTx = transactions) => {
    const headers = ['ID', 'Date', 'Type', 'Title', 'Amount', 'Currency', 'Category', 'Payment Method', 'Tags', 'Notes', 'Recurring']
    const rows = filteredTx.map((tx) => {
      const cat = getCategory(tx.categoryId)
      return [
        `"${tx.id}"`,
        `"${tx.date}"`,
        `"${tx.type.toUpperCase()}"`,
        `"${(tx.title || '').replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        `"${currency.code}"`,
        `"${cat.name.replace(/"/g, '""')}"`,
        `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`,
        `"${(tx.tags || []).join(', ')}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
        `"${tx.recurring ? 'Yes' : 'No'}"`,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `SpendPulse_Export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      currency,
      categories,
      transactions,
    }
    const jsonStr = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `SpendPulse_Backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importFromJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions)
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories)
      }
      if (data.currency) {
        setCurrencyState(data.currency)
      }
      return { success: true, count: data.transactions?.length || 0 }
    } catch (err) {
      console.error('Import error', err)
      return { success: false, error: err.message }
    }
  }

  const generatePDFReport = (filteredTx = transactions, title = 'Financial Statement & Report') => {
    const doc = new jsPDF()
    const nowStr = new Date().toLocaleDateString(currency.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Header Banner
    doc.setFillColor(15, 23, 42) // #0f172a
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('SpendPulse Financial Statement', 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated on ${nowStr} • Currency: ${currency.name} (${currency.symbol})`, 14, 30)

    // KPI Summary Metrics Box
    let totalInc = 0
    let totalExp = 0
    filteredTx.forEach((t) => {
      if (t.type === 'income') totalInc += t.amount
      else totalExp += t.amount
    })
    const netBal = totalInc - totalExp
    const rate = totalInc > 0 ? ((netBal / totalInc) * 100).toFixed(1) : '0'

    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Financial Summary', 14, 52)

    autoTable(doc, {
      startY: 56,
      head: [['Total Income', 'Total Expenses', 'Net Balance', 'Savings Rate', 'Transactions']],
      body: [[
        `+${currency.symbol}${totalInc.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}`,
        `-${currency.symbol}${totalExp.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}`,
        `${netBal >= 0 ? '+' : ''}${currency.symbol}${netBal.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}`,
        `${rate}%`,
        `${filteredTx.length} records`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, halign: 'center' },
    })

    // Category Summary
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    const nextY = (doc.lastAutoTable?.finalY || 80) + 12
    doc.text('Itemized Transaction Records', 14, nextY)

    const tableRows = filteredTx.map((tx) => {
      const cat = getCategory(tx.categoryId)
      return [
        tx.date,
        tx.type.toUpperCase(),
        tx.title,
        cat.name,
        tx.paymentMethod || '—',
        `${tx.type === 'income' ? '+' : '-'}${currency.symbol}${tx.amount.toLocaleString(currency.locale, { minimumFractionDigits: 2 })}`,
      ]
    })

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Date', 'Type', 'Description', 'Category', 'Payment Method', 'Amount']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      styles: { fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 20 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      },
    })

    // Save PDF
    doc.save(`SpendPulse_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const value = {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    formatAmount,
    categories,
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    addCategory,
    editCategory,
    deleteCategory,
    updateBudget,
    resetToDemoData,
    clearAllData,
    getCategory,
    metrics,
    monthlyStats,
    categoryStats,
    currentMonthBudgets,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    generatePDFReport,
  }

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider')
  }
  return context
}
