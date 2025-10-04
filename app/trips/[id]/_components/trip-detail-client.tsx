
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, MapPin, Calendar, Users as UsersIcon, Share2, Settings } from 'lucide-react'
import { BalancesSummary } from './balances-summary'
import { RecentExpenses } from './recent-expenses'
import { DebtMatrix } from './debt-matrix'
import { ExpenseForm } from './expense-form'
import { TransferDialog } from './transfer-dialog'
import { InviteMembersDialog } from './invite-members-dialog'
import { SettlementSuggestions } from './settlement-suggestions'

type TripData = {
  id: string
  name: string
  description: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  currency: string
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string | null
      email: string
      username: string | null
    }
  }>
  expenses: Array<{
    id: string
    amount: string
    description: string
    date: string
    payer: {
      id: string
      user: {
        name: string | null
        email: string
      }
    }
    shares: Array<{
      id: string
      shareAmount: string
      member: {
        id: string
        user: {
          name: string | null
        }
      }
    }>
  }>
  transfers: Array<{
    id: string
    amount: string
    createdAt: string
    fromMember: {
      id: string
      user: {
        name: string | null
      }
    }
    toMember: {
      id: string
      user: {
        name: string | null
      }
    }
  }>
  invites: Array<{
    id: string
    email: string
    token: string
    createdAt: string
  }>
}

type TransferData = {
  fromMemberId: string
  toMemberId: string
  amount: number
}

export function TripDetailClient({ tripId }: { tripId: string }) {
  const { data: session } = useSession() || {}
  const [trip, setTrip] = useState<TripData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [transferData, setTransferData] = useState<TransferData | null>(null)

  useEffect(() => {
    fetchTrip()
  }, [tripId])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setTrip(data)
      }
    } catch (error) {
      console.error('Failed to fetch trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransferFromMatrix = (fromMemberId: string, toMemberId: string, amount: number) => {
    setTransferData({ fromMemberId, toMemberId, amount })
    setShowTransferDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <p className="text-gray-600">This trip may have been deleted or you don&apos;t have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {trip.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.location}</span>
                </div>
              )}
              {trip.startDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString()}
                    {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-4 h-4" />
                <span>{trip.members.length} members</span>
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {trip.currency}
              </div>
            </div>
            {trip.description && (
              <p className="text-gray-600 mt-2">{trip.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowInviteDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Invite</span>
            </button>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Balances Summary */}
        <BalancesSummary trip={trip} />

        {/* Settlement Suggestions */}
        <SettlementSuggestions 
          trip={trip} 
          onTransferCreated={fetchTrip}
          onOpenTransfer={handleTransferFromMatrix}
        />

        {/* Recent Expenses */}
        <RecentExpenses 
          expenses={trip.expenses.slice(0, 5)} 
          currency={trip.currency}
        />

        {/* Debt Matrix */}
        <DebtMatrix 
          trip={trip} 
          onTransferClick={handleTransferFromMatrix}
        />
      </div>

      {/* Dialogs */}
      <ExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        tripId={trip.id}
        members={trip.members}
        currency={trip.currency}
        lastExpenseDate={trip.expenses[0]?.date}
        onExpenseCreated={fetchTrip}
      />

      <TransferDialog
        open={showTransferDialog}
        onClose={() => {
          setShowTransferDialog(false)
          setTransferData(null)
        }}
        tripId={trip.id}
        members={trip.members}
        currency={trip.currency}
        onTransferCreated={fetchTrip}
        initialData={transferData}
      />

      <InviteMembersDialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        trip={trip}
        onInviteSent={fetchTrip}
      />
    </div>
  )
}
