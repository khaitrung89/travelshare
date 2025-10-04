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

type TransferDialogProps = {
  open: boolean
  onClose: () => void
  tripId: string
  members: Member[]
  currency: string
  onTransferCreated: () => void
  initialData?: {
    fromMemberId: string
    toMemberId: string
    amount: number
  } | null
}

export function TransferDialog({
  open,
  onClose,
  tripId,
  members,
  currency,
  onTransferCreated,
  initialData,
}: TransferDialogProps) {
  const [formData, setFormData] = useState({
    fromMemberId: '',
    toMemberId: '',
    amount: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        fromMemberId: initialData.fromMemberId,
        toMemberId: initialData.toMemberId,
        amount: initialData.amount.toString(),
      })
    } else if (open && members.length >= 2) {
      setFormData({
        fromMemberId: members[0].id,
        toMemberId: members[1].id,
        amount: '',
      })
    }
  }, [open, initialData, members])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create transfer')
      }

      setFormData({
        fromMemberId: members[0]?.id || '',
        toMemberId: members[1]?.id || '',
        amount: '',
      })
      onTransferCreated()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create transfer')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Record Transfer</h2>
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
            <label htmlFor="fromMemberId" className="block text-sm font-medium text-gray-700 mb-1">
              From <span className="text-red-500">*</span>
            </label>
            <select
              id="fromMemberId"
              required
              value={formData.fromMemberId}
              onChange={(e) => setFormData({ ...formData, fromMemberId: e.target.value })}
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
            <label htmlFor="toMemberId" className="block text-sm font-medium text-gray-700 mb-1">
              To <span className="text-red-500">*</span>
            </label>
            <select
              id="toMemberId"
              required
              value={formData.toMemberId}
              onChange={(e) => setFormData({ ...formData, toMemberId: e.target.value })}
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
              {loading ? 'Recording...' : 'Record Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
