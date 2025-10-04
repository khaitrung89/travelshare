
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { TripDetailClient } from './_components/trip-detail-client'

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <TripDetailClient tripId={params.id} />
    </div>
  )
}
