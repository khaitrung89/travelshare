'use client'

import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { calculateBalances } from '@/lib/balance-calculator'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function BalancesSummary({ trip }: { trip: any }) {
  const balances = calculateBalances(trip.members, trip.expenses, trip.transfers)

  const chartData = balances
    .filter((b) => Math.abs(b.balance) > 0.01)
    .map((b) => ({
      name: b.memberName,
      value: Math.abs(b.balance),
      balance: b.balance,
    }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <span>Balance Summary</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Balance List */}
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div
              key={balance.memberId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {balance.memberName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{balance.memberName}</div>
                  <div className="text-xs text-gray-500">
                    Paid: {formatCurrency(balance.paid)} {trip.currency}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold flex items-center space-x-1 ${
                  balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {balance.balance > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : balance.balance < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span>{formatCurrency(Math.abs(balance.balance))}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {balance.balance > 0 ? 'is owed' : balance.balance < 0 ? 'owes' : 'settled'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${formatCurrency(value)} ${trip.currency}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <p>No expenses yet</p>
              <p className="text-sm mt-2">Add expenses to see the balance breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
