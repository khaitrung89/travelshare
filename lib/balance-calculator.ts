
import { Decimal } from '@prisma/client/runtime/library'

type Member = {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type Expense = {
  id: string
  amount: string
  payer?: {
    id: string
  }
  payerId?: string
  shares: Array<{
    memberId?: string
    shareAmount: string
    member?: {
      id: string
    }
  }>
}

type Transfer = {
  id: string
  amount: string
  fromMemberId: string
  toMemberId: string
}

export type MemberBalance = {
  memberId: string
  memberName: string
  paid: number
  owed: number
  balance: number // positive = owed to them, negative = they owe
}

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  transfers: Transfer[]
): MemberBalance[] {
  const balances = new Map<string, MemberBalance>()

  // Initialize balances for all members
  members.forEach((member) => {
    balances.set(member.id, {
      memberId: member.id,
      memberName: member.user.name || member.user.email,
      paid: 0,
      owed: 0,
      balance: 0,
    })
  })

  // Calculate from expenses
  expenses.forEach((expense) => {
    const payerId = expense.payerId || expense.payer?.id
    const payer = payerId ? balances.get(payerId) : undefined
    if (payer) {
      payer.paid += parseFloat(expense.amount)
    }

    expense.shares.forEach((share) => {
      const memberId = share.memberId || share.member?.id
      const member = memberId ? balances.get(memberId) : undefined
      if (member) {
        member.owed += parseFloat(share.shareAmount)
      }
    })
  })

  // Apply transfers
  transfers.forEach((transfer) => {
    const from = balances.get(transfer.fromMemberId)
    const to = balances.get(transfer.toMemberId)
    const amount = parseFloat(transfer.amount)

    if (from) {
      from.paid += amount
    }
    if (to) {
      to.owed += amount
    }
  })

  // Calculate final balances
  balances.forEach((balance) => {
    balance.balance = balance.paid - balance.owed
  })

  return Array.from(balances.values()).sort((a, b) => b.balance - a.balance)
}

export type Settlement = {
  from: string
  to: string
  amount: number
}

export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount)

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ id: b.memberId, name: b.memberName, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []

  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]

    const amount = Math.min(creditor.amount, debtor.amount)

    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100,
      })
    }

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount < 0.01) i++
    if (debtor.amount < 0.01) j++
  }

  return settlements
}

export function calculateDebtMatrix(balances: MemberBalance[], expenses: Expense[]): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>()

  // Initialize matrix
  balances.forEach((balance) => {
    matrix.set(balance.memberId, new Map())
  })

  // Calculate who owes whom based on expenses
  expenses.forEach((expense) => {
    const payerId = expense.payerId || expense.payer?.id
    if (!payerId) return

    expense.shares.forEach((share) => {
      const memberId = share.memberId || share.member?.id
      if (!memberId || memberId === payerId) return
      
      const amount = parseFloat(share.shareAmount)
      const memberRow = matrix.get(memberId)
      if (memberRow) {
        const currentDebt = memberRow.get(payerId) || 0
        memberRow.set(payerId, currentDebt + amount)
      }
    })
  })

  return matrix
}
