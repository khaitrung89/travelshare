'use client'

import { useState } from 'react'
import { X, Mail, Copy, QrCode, Check, Send } from 'lucide-react'
import QRCode from 'qrcode'

export function InviteMembersDialog({
  open,
  onClose,
  trip,
  onInviteSent,
}: {
  open: boolean
  onClose: () => void
  trip: any
  onInviteSent: () => void
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${trip.uniqueLink}`

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await fetch(`/api/trips/${trip.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invite')
      }

      const data = await response.json()
      
      // Show appropriate message based on whether user exists
      if (data.notificationSent) {
        setSuccessMessage(
          `✓ In-app notification sent to ${email}! They can accept the invite from their notifications.`
        )
      } else {
        setSuccessMessage(
          `✓ Invite created for ${email}. Since they don't have an account yet, please share the invite link below with them.`
        )
      }
      
      setEmail('')
      onInviteSent()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShowQR = async () => {
    if (!showQR) {
      try {
        const url = await QRCode.toDataURL(inviteLink, {
          width: 300,
          margin: 2,
        })
        setQrCodeUrl(url)
        setShowQR(true)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    } else {
      setShowQR(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Invite Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite by email */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Invite by Email</span>
            </h3>
            <form onSubmit={handleSendInvite} className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="friend@example.com"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Invite'}</span>
              </button>
            </form>
          </div>

          {/* Share link */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Link</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={handleShowQR}
              className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>
            {showQR && qrCodeUrl && (
              <div className="mt-4 flex justify-center p-4 bg-gray-50 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
          </div>

          {/* Current members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Members ({trip.members?.length || 0})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trip.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-xs text-gray-500">{member.user.email}</div>
                  </div>
                  {member.role === 'owner' && (
                    <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending invites */}
          {trip.invites && trip.invites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pending Invites ({trip.invites.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {trip.invites.map((invite: any) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{invite.email}</div>
                      <div className="text-xs text-gray-500">
                        Sent {new Date(invite.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
