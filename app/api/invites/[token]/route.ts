
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/invites/[token] - Get invite details (supports both invite token and trip unique link)
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // First, try to find by invite token
    let invite = await prisma.invite.findUnique({
      where: { token: params.token },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            location: true,
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

    // If not found by token, try to find trip by uniqueLink
    // This allows using the trip's share link as a general invite
    if (!invite) {
      const trip = await prisma.trip.findUnique({
        where: { uniqueLink: params.token },
        select: {
          id: true,
          name: true,
          location: true,
          members: {
            take: 1,
            where: {
              role: 'owner'
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
      })

      if (!trip) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
      }

      // Return trip info formatted like an invite
      const owner = trip.members[0]
      return NextResponse.json({
        id: trip.id,
        email: '',
        status: 'pending',
        trip: {
          id: trip.id,
          name: trip.name,
          location: trip.location,
        },
        invitedBy: {
          name: owner?.user.name || null,
          email: owner?.user.email || '',
        },
        isGeneralInvite: true, // Flag to indicate this is a general invite via trip link
      })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invite is no longer valid', status: invite.status },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      })
      return NextResponse.json(
        { error: 'Invite has expired', status: 'expired' },
        { status: 400 }
      )
    }

    return NextResponse.json(invite)
  } catch (error) {
    console.error('Failed to fetch invite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

// POST /api/invites/[token]/accept - Accept invite (supports both invite token and trip unique link)
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, try to find by invite token
    let invite = await prisma.invite.findUnique({
      where: { token: params.token },
    })

    let tripId: string

    // If not found by token, try to find trip by uniqueLink (general invite)
    if (!invite) {
      const trip = await prisma.trip.findUnique({
        where: { uniqueLink: params.token },
        select: { id: true },
      })

      if (!trip) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
      }

      tripId = trip.id
    } else {
      // Validate specific invite
      if (invite.status !== 'pending') {
        return NextResponse.json(
          { error: 'Invite is no longer valid' },
          { status: 400 }
        )
      }

      if (invite.expiresAt < new Date()) {
        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: 'expired' },
        })
        return NextResponse.json(
          { error: 'Invite has expired' },
          { status: 400 }
        )
      }

      tripId = invite.tripId
    }

    // Check if user is already a member
    const existingMember = await prisma.tripMember.findFirst({
      where: {
        tripId: tripId,
        userId: session.user.id,
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this trip' },
        { status: 400 }
      )
    }

    // Create trip member and mark invite as accepted (if it's a specific invite)
    if (invite) {
      await prisma.$transaction([
        prisma.tripMember.create({
          data: {
            tripId: tripId,
            userId: session.user.id,
            role: 'member',
          },
        }),
        prisma.invite.update({
          where: { id: invite.id },
          data: { status: 'accepted' },
        }),
      ])
    } else {
      // For general invites (via trip link), just add as member
      await prisma.tripMember.create({
        data: {
          tripId: tripId,
          userId: session.user.id,
          role: 'member',
        },
      })
    }

    return NextResponse.json({ 
      message: 'Successfully joined trip',
      tripId: tripId,
    })
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    )
  }
}
