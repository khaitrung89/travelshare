
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/trips/[id]/invites - List invites for trip
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member
    const membership = await prisma.tripMember.findFirst({
      where: {
        tripId: params.id,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const invites = await prisma.invite.findMany({
      where: {
        tripId: params.id,
        status: 'pending',
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Failed to fetch invites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[id]/invites - Create invite
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member
    const membership = await prisma.tripMember.findFirst({
      where: {
        tripId: params.id,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const existingMember = await prisma.tripMember.findFirst({
        where: {
          tripId: params.id,
          userId: existingUser.id,
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member' },
          { status: 400 }
        )
      }
    }

    // Check for existing pending invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        tripId: params.id,
        email,
        status: 'pending',
      },
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invite already sent to this email' },
        { status: 400 }
      )
    }

    const invite = await prisma.invite.create({
      data: {
        tripId: params.id,
        email,
        invitedByUserId: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        trip: {
          select: {
            name: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // If user already exists, create a notification
    let notificationSent = false
    if (existingUser) {
      await prisma.notification.create({
        data: {
          userId: existingUser.id,
          type: 'trip_invite',
          title: 'Trip Invitation',
          message: `${invite.invitedBy.name || invite.invitedBy.email} invited you to join "${invite.trip.name}"`,
          tripId: params.id,
          inviteId: invite.id,
        },
      })
      notificationSent = true
    }

    return NextResponse.json({ 
      ...invite, 
      notificationSent,
      userExists: !!existingUser 
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create invite:', error)
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    )
  }
}
