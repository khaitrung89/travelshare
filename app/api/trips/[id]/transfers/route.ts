
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

// POST /api/trips/[id]/transfers - Create transfer
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
    const { fromMemberId, toMemberId, amount } = body

    if (!fromMemberId || !toMemberId || !amount) {
      return NextResponse.json(
        { error: 'From, to, and amount are required' },
        { status: 400 }
      )
    }

    if (fromMemberId === toMemberId) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same member' },
        { status: 400 }
      )
    }

    const transfer = await prisma.transfer.create({
      data: {
        tripId: params.id,
        fromMemberId,
        toMemberId,
        amount: new Decimal(amount),
      },
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
    })

    return NextResponse.json(transfer, { status: 201 })
  } catch (error) {
    console.error('Failed to create transfer:', error)
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    )
  }
}
