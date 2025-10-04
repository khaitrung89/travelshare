'use client'

import { calculateBalances, calculateDebtMatrix } from '@/lib/balance-calculator'
import { Grid3x3 } from 'lucide-react'

export function DebtMatrix({ 
  trip,
  onTransferClick,
}: { 
  trip: any
  onTransferClick: (fromMemberId: string, toMemberId: string, amount: number) => void
}) {
  const balances = calculateBalances(trip.members, trip.expenses, trip.transfers)
  const matrix = calculateDebtMatrix(balances, trip.expenses)

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) < 0.01) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (trip.members.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <Grid3x3 className="w-6 h-6 text-blue-600" />
        <span>Debt Matrix</span>
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Click on a cell to record a settlement. Rows show who owes money, columns show who is owed.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
                Owes →
              </th>
              {trip.members.map((member: any) => (
                <th
                  key={member.id}
                  className="p-2 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-300"
                >
                  <div className="truncate max-w-[100px]">
                    {member.user.name || member.user.email.split('@')[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trip.members.map((rowMember: any) => {
              const rowDebts = matrix.get(rowMember.id) || new Map()
              return (
                <tr key={rowMember.id} className="border-b border-gray-200">
                  <td className="p-2 text-sm font-semibold text-gray-700">
                    <div className="truncate max-w-[120px]">
                      {rowMember.user.name || rowMember.user.email.split('@')[0]}
                    </div>
                  </td>
                  {trip.members.map((colMember: any) => {
                    const debt = rowDebts.get(colMember.id) || 0
                    const isClickable = debt > 0.01 && rowMember.id !== colMember.id

                    return (
                      <td
                        key={colMember.id}
                        className="p-2 text-center text-sm"
                      >
                        {rowMember.id === colMember.id ? (
                          <div className="text-gray-300">-</div>
                        ) : isClickable ? (
                          <button
                            onClick={() => onTransferClick(rowMember.id, colMember.id, debt)}
                            className="w-full px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold transition-colors"
                          >
                            {formatCurrency(debt)}
                          </button>
                        ) : (
                          <div className="text-gray-400">
                            {formatCurrency(debt)}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span>Clickable to settle</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>No debt</span>
        </div>
      </div>
    </div>
  )
}
