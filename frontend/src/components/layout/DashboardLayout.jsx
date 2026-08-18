import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import TransactionModal from '../modals/TransactionModal'
import CategoryModal from '../modals/CategoryModal'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [modalDefaultType, setModalDefaultType] = useState('expense')
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleOpenAddModal = (type = 'expense') => {
    setEditingTransaction(null)
    setModalDefaultType(type)
    setTransactionModalOpen(true)
  }

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction)
    setModalDefaultType(transaction.type)
    setTransactionModalOpen(true)
  }

  const handleOpenCategoryModal = (cat = null, defaultType = 'expense') => {
    setEditingCategory(cat)
    setModalDefaultType(defaultType)
    setCategoryModalOpen(true)
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onOpenAddModal={() => handleOpenAddModal('expense')}
      />

      {/* Main Content Area */}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="page-container">
          <Outlet
            context={{
              onOpenAddModal: handleOpenAddModal,
              onOpenEditModal: handleOpenEditModal,
              onOpenCategoryModal: handleOpenCategoryModal,
            }}
          />
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        initialData={editingTransaction}
        defaultType={modalDefaultType}
      />

      {/* Global Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        initialData={editingCategory}
        defaultType={modalDefaultType}
      />
    </div>
  )
}
