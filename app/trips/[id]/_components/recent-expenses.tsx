'use client'

import { Receipt, Calendar, User } from 'lucide-react'

type Expense = {
  id: string
  amount: string
  description: string
  date: string
  payer: {
    user: {
      name: string | null
      email: string
    }
  }
  shares: Array<{
    member: {
      user: {
        name: string | null
      }
    }
  }>
}

export function RecentExpenses({ 
  expenses,
  currency,
}: { 
  expenses: Expense[]
  currency: string
}) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <Receipt className="w-6 h-6 text-blue-600" />
        <span>Recent Expenses</span>
      </h2>

      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No expenses yet</p>
          <p className="text-sm mt-1">Add your first expense to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{expense.description}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Paid by {expense.payer.user.name || expense.payer.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Split among {expense.shares.length} {expense.shares.length === 1 ? 'person' : 'people'}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(expense.amount)}
                </div>
                <div className="text-xs text-gray-500">{currency}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
