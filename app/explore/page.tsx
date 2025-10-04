
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { Compass } from 'lucide-react'

export default async function ExplorePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Compass className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Feed Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Discover public trips and adventures shared by other travelers. This feature will allow you to explore and get inspired by travel stories from around the world.
          </p>
        </div>
      </div>
    </div>
  )
}
