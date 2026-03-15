import { Expense } from '../models/Expense';
import { Group } from '../models/Group';

export interface Balance {
  userId: string;
  name: string;
  paid: number;
  spent: number;
  balance: number; // positive = they are owed, negative = they owe
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export const calculateGroupBalances = async (groupId: string) => {
  const group = await Group.findById(groupId).populate('members');
  if (!group) throw new Error('Group not found');

  const expenses = await Expense.find({ groupId });

  // Initialize balances for all members
  const balances: Map<string, Balance> = new Map();
  group.members.forEach((member: any) => {
    balances.set(member._id.toString(), {
      userId: member._id.toString(),
      name: member.name,
      paid: 0,
      spent: 0,
      balance: 0,
    });
  });

  // Calculate paid and spent amounts
  expenses.forEach((expense) => {
    const paidBy = expense.paidBy.toString();
    const participants = expense.participants.map((p) => p.toString());

    // Add to paid amount
    if (balances.has(paidBy)) {
      const balance = balances.get(paidBy)!;
      balance.paid += expense.amount;
    }

    // Split amount among participants
    const splitAmount = expense.amount / participants.length;
    participants.forEach((participant) => {
      if (balances.has(participant)) {
        const balance = balances.get(participant)!;
        balance.spent += splitAmount;
      }
    });
  });

  // Calculate final balance
  balances.forEach((balance) => {
    balance.balance = balance.paid - balance.spent;
  });

  return Array.from(balances.values());
};

export const calculateSettlements = async (groupId: string): Promise<Settlement[]> => {
  const balances = await calculateGroupBalances(groupId);

  const settlements: Settlement[] = [];
  const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount,
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) debtorIdx++;
    if (creditor.balance < 0.01) creditorIdx++;
  }

  return settlements;
};

export const calculateContributions = async (groupId: string) => {
  const expenses = await Expense.find({ groupId }).populate('paidBy');

  const contributions: Map<string, { name: string; amount: number }> = new Map();

  expenses.forEach((expense) => {
    const userId = (expense.paidBy as any)._id.toString();
    const userName = (expense.paidBy as any).name;

    if (!contributions.has(userId)) {
      contributions.set(userId, { name: userName, amount: 0 });
    }

    const contrib = contributions.get(userId)!;
    contrib.amount += expense.amount;
  });

  return Array.from(contributions.values());
};
