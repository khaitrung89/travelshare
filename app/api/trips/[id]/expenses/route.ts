
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

// POST /api/trips/[id]/expenses - Create expense
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
    const { payerId, amount, description, date, participantIds } = body

    if (!payerId || !amount || !description) {
      return NextResponse.json(
        { error: 'Payer, amount, and description are required' },
        { status: 400 }
      )
    }

    // Get all members if no participants specified
    const participants = participantIds && participantIds.length > 0
      ? participantIds
      : (await prisma.tripMember.findMany({
          where: { tripId: params.id },
          select: { id: true },
        })).map((m: { id: string }) => m.id)

    const shareAmount = new Decimal(amount).dividedBy(participants.length)

    // Determine the date to use
    let expenseDate = date ? new Date(date) : new Date()
    
    // If no date provided, use the last expense date
    if (!date) {
      const lastExpense = await prisma.expense.findFirst({
        where: { tripId: params.id },
        orderBy: { date: 'desc' },
      })
      if (lastExpense) {
        expenseDate = lastExpense.date
      }
    }

    const expense = await prisma.expense.create({
      data: {
        tripId: params.id,
        payerId,
        amount: new Decimal(amount),
        description,
        date: expenseDate,
        shares: {
          create: participants.map((memberId: string) => ({
            memberId,
            shareAmount,
          })),
        },
      },
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
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Failed to create expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
