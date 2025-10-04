
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/trips/[id] - Get trip details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
              },
            },
            paidExpenses: {
              include: {
                shares: {
                  include: {
                    member: {
                      include: {
                        user: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: {
                date: 'desc',
              },
            },
            expenseShares: {
              include: {
                expense: true,
              },
            },
          },
        },
        expenses: {
          include: {
            payer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            shares: {
              include: {
                member: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
        transfers: {
          include: {
            fromMember: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            toMember: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        invites: {
          where: {
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
        },
        posts: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Failed to fetch trip:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}

// PATCH /api/trips/[id] - Update trip
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of the trip
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
    const { name, description, location, startDate, endDate, currency, discoverable } = body

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(currency && { currency }),
        ...(discoverable !== undefined && { discoverable }),
      },
    })

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Failed to update trip:', error)
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/[id] - Delete trip (owner only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const membership = await prisma.tripMember.findFirst({
      where: {
        tripId: params.id,
        userId: session.user.id,
        role: 'owner',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only trip owners can delete trips' },
        { status: 403 }
      )
    }

    await prisma.trip.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Failed to delete trip:', error)
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    )
  }
}
