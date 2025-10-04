
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/notifications/[id]/accept - Accept trip invite from notification
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notification
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (notification.type !== 'trip_invite') {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    if (!notification.inviteId || !notification.tripId) {
      return NextResponse.json({ error: 'Invalid notification data' }, { status: 400 })
    }

    // Get invite
    const invite = await prisma.invite.findUnique({
      where: { id: notification.inviteId },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer valid' }, { status: 400 })
    }

    // Check if already a member
    const existingMember = await prisma.tripMember.findFirst({
      where: {
        tripId: notification.tripId,
        userId: session.user.id,
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Add user to trip and update invite
    await prisma.$transaction([
      prisma.tripMember.create({
        data: {
          tripId: notification.tripId,
          userId: session.user.id,
          role: 'member',
        },
      }),
      prisma.invite.update({
        where: { id: notification.inviteId },
        data: { status: 'accepted' },
      }),
      prisma.notification.update({
        where: { id: params.id },
        data: { read: true },
      }),
    ])

    return NextResponse.json({ success: true, tripId: notification.tripId })
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    )
  }
}
