
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/invites/[token]/revoke - Revoke invite
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if user is owner of the trip
    const membership = await prisma.tripMember.findFirst({
      where: {
        tripId: invite.tripId,
        userId: session.user.id,
        role: 'owner',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only trip owners can revoke invites' },
        { status: 403 }
      )
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'revoked' },
    })

    return NextResponse.json({ message: 'Invite revoked successfully' })
  } catch (error) {
    console.error('Failed to revoke invite:', error)
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    )
  }
}
