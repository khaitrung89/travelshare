'use client'

import { Lightbulb, ArrowRight } from 'lucide-react'
import { calculateBalances, calculateSettlements } from '@/lib/balance-calculator'

export function SettlementSuggestions({ 
  trip,
  onTransferCreated,
  onOpenTransfer,
}: { 
  trip: any
  onTransferCreated: () => void
  onOpenTransfer: (fromMemberId: string, toMemberId: string, amount: number) => void
}) {
  const balances = calculateBalances(trip.members, trip.expenses, trip.transfers)
  const settlements = calculateSettlements(balances)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSettlementClick = (settlement: { from: string; to: string; amount: number }) => {
    const fromMember = trip.members.find(
      (m: any) => (m.user.name || m.user.email) === settlement.from
    )
    const toMember = trip.members.find(
      (m: any) => (m.user.name || m.user.email) === settlement.to
    )

    if (fromMember && toMember) {
      onOpenTransfer(fromMember.id, toMember.id, settlement.amount)
    }
  }

  if (settlements.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <span>Suggested Settlements</span>
      </h2>

      <p className="text-gray-600 mb-4">
        Settle all balances with {settlements.length} {settlements.length === 1 ? 'transaction' : 'transactions'}:
      </p>

      <div className="space-y-3">
        {settlements.map((settlement, index) => (
          <button
            key={index}
            onClick={() => handleSettlementClick(settlement)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg hover:from-blue-100 hover:to-green-100 transition-all group border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {settlement.from.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-900">{settlement.from}</span>
            </div>

            <div className="flex items-center space-x-3 px-4">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(settlement.amount)} {trip.currency}
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>

            <div className="flex items-center space-x-3 flex-1 justify-end">
              <span className="font-semibold text-gray-900">{settlement.to}</span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                {settlement.to.charAt(0).toUpperCase()}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Click on a settlement to record the transfer
      </p>
    </div>
  )
}
