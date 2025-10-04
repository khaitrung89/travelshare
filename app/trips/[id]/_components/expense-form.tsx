'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

type Member = {
  id: string
  user: {
    name: string | null
    email: string
  }
}

type ExpenseFormProps = {
  open: boolean
  onClose: () => void
  tripId: string
  members: Member[]
  currency: string
  lastExpenseDate?: string
  onExpenseCreated: () => void
}

export function ExpenseForm({
  open,
  onClose,
  tripId,
  members,
  currency,
  lastExpenseDate,
  onExpenseCreated,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    payerId: '',
    amount: '',
    description: '',
    date: '',
  })
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && members.length > 0) {
      // Default to all members selected
      setSelectedParticipants(new Set(members.map((m) => m.id)))
      
      // Set default payer if not set
      if (!formData.payerId) {
        setFormData((prev) => ({ ...prev, payerId: members[0].id }))
      }

      // Set default date
      if (!formData.date) {
        const defaultDate = lastExpenseDate 
          ? new Date(lastExpenseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        setFormData((prev) => ({ ...prev, date: defaultDate }))
      }
    }
  }, [open, members, lastExpenseDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedParticipants.size === 0) {
      setError('Please select at least one participant')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          participantIds: Array.from(selectedParticipants),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create expense')
      }

      setFormData({
        payerId: members[0]?.id || '',
        amount: '',
        description: '',
        date: lastExpenseDate 
          ? new Date(lastExpenseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      })
      setSelectedParticipants(new Set(members.map((m) => m.id)))
      onExpenseCreated()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const toggleParticipant = (memberId: string) => {
    const newSet = new Set(selectedParticipants)
    if (newSet.has(memberId)) {
      newSet.delete(memberId)
    } else {
      newSet.add(memberId)
    }
    setSelectedParticipants(newSet)
  }

  const toggleAll = () => {
    if (selectedParticipants.size === members.length) {
      setSelectedParticipants(new Set())
    } else {
      setSelectedParticipants(new Set(members.map((m) => m.id)))
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              id="description"
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Dinner at restaurant"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="100.00"
            />
          </div>

          <div>
            <label htmlFor="payerId" className="block text-sm font-medium text-gray-700 mb-1">
              Paid by <span className="text-red-500">*</span>
            </label>
            <select
              id="payerId"
              required
              value={formData.payerId}
              onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.user.name || member.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Split among <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedParticipants.size === members.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.has(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">
                    {member.user.name || member.user.email}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedParticipants.size} {selectedParticipants.size === 1 ? 'person' : 'people'} selected
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
