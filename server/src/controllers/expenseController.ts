import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { calculateContributions, calculateGroupBalances, calculateSettlements } from '../utils/balance';

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, groupId, participants, excludedMembers } = req.body;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const expense = new Expense({
      title,
      amount,
      paidBy: new Types.ObjectId(req.userId),
      groupId: new Types.ObjectId(groupId),
      participants: participants.map((id: string) => new Types.ObjectId(id)),
      excludedMembers: excludedMembers?.map((id: string) => new Types.ObjectId(id)) || [],
    });

    await expense.save();
    await expense.populate('paidBy participants');

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy')
      .populate('participants')
      .sort({ createdAt: -1 });

    res.status(200).json({ expenses });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;
    const { title, amount, paidBy, participants, excludedMembers } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    if (paidBy) {
      expense.paidBy = new Types.ObjectId(paidBy);
    }
    if (participants) {
      expense.participants = participants.map((id: string) => new Types.ObjectId(id));
    }
    if (excludedMembers) {
      expense.excludedMembers = excludedMembers.map((id: string) => new Types.ObjectId(id));
    }

    await expense.save();
    await expense.populate('paidBy participants');

    res.status(200).json({
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the person who paid can delete' });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.status(200).json({
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

export const getGroupBalances = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const balances = await calculateGroupBalances(groupId);
    const settlements = await calculateSettlements(groupId);
    const contributions = await calculateContributions(groupId);

    res.status(200).json({
      balances,
      settlements,
      contributions,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to calculate balances', error: error.message });
  }
};
