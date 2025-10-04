
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { User, MapPin } from 'lucide-react'
import prisma from '@/lib/db'

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // For now, just show the current user's profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tripMembers: {
        include: {
          trip: {
            include: {
              _count: {
                select: {
                  members: true,
                  expenses: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    redirect('/trips')
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name || user.email}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* Trips */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Trips ({user.tripMembers.length})</span>
          </h2>

          {user.tripMembers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No trips yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.tripMembers.map((membership) => (
                <a
                  key={membership.id}
                  href={`/trips/${membership.trip.id}`}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{membership.trip.name}</h3>
                    {membership.role === 'owner' && (
                      <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                  {membership.trip.location && (
                    <p className="text-sm text-gray-600 mb-2">{membership.trip.location}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{membership.trip._count.members} members</span>
                    <span>{membership.trip._count.expenses} expenses</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
