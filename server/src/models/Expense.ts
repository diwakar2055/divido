import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExpense extends Document {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  paidBy: Types.ObjectId;
  groupId: Types.ObjectId;
  participants: Types.ObjectId[];
  excludedMembers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    excludedMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
