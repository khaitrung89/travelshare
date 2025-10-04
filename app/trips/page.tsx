
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { TripsListClient } from './_components/trips-list-client'

export default async function TripsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <TripsListClient />
    </div>
  )
}
