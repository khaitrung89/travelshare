
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plane, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

type InviteData = {
  id: string
  email: string
  status: string
  trip: {
    id: string
    name: string
    location: string | null
  }
  invitedBy: {
    name: string | null
    email: string
  }
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [params.token])

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid invite')
      } else {
        setInvite(data)
      }
    } catch (error) {
      setError('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/invite/${params.token}`)
      return
    }

    setAccepting(true)
    setError('')

    try {
      const response = await fetch(`/api/invites/${params.token}/accept`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/trips/${data.tripId}`)
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully joined!</h2>
          <p className="text-gray-600">Redirecting to the trip...</p>
        </div>
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Invite</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/trips"
            className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to My Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re invited!</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">{invite.invitedBy.name || invite.invitedBy.email}</span> invited you to join:
          </p>
          <h3 className="text-xl font-bold text-gray-900">{invite.trip.name}</h3>
          {invite.trip.location && (
            <p className="text-sm text-gray-600 mt-1">{invite.trip.location}</p>
          )}
        </div>

        {!session ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center mb-4">
              Sign in or create an account to accept this invite
            </p>
            <button
              onClick={handleAccept}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Sign in to Accept
            </button>
            <Link
              href="/signup"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {accepting ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Joining...</span>
                </span>
              ) : (
                'Accept & Join Trip'
              )}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This invite will expire in 7 days
          </p>
        </div>
      </div>
    </div>
  )
}
