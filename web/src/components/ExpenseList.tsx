import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import React from 'react';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  paidBy: { name: string; _id: string };
  participants: { name: string; _id: string }[];
  createdAt: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (expenseId: string) => void;
  onEdit?: (expense: Expense) => void;
  currentUserId?: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
  onEdit,
  currentUserId,
}) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6'>
        <p className='text-gray-500 text-center'>No expenses yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <h3 className='text-lg font-semibold text-gray-800'>Recent Expenses</h3>
      {expenses.map((expense) => (
        <div
          key={expense._id}
          className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition'
        >
          <div className='flex items-start justify-between mb-2'>
            <div className='flex-1'>
              <p className='font-semibold text-gray-800'>{expense.title}</p>
              <p className='text-sm text-gray-500'>
                💳 Paid by <span className='font-semibold'>{expense.paidBy.name}</span>
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {formatDistanceToNow(new Date(expense.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className='text-right'>
              <div className='text-xl font-bold text-blue-600'>${expense.amount.toFixed(2)}</div>
            </div>
          </div>

          {/* Participants */}
          <div className='mt-3 pt-3 border-t border-gray-200'>
            <p className='text-xs font-semibold text-gray-600 mb-2'>
              👥 Split among ({expense.participants.length}):
            </p>
            <div className='flex flex-wrap gap-2'>
              {expense.participants.map((participant) => (
                <span
                  key={participant._id}
                  className='inline-block bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full'
                >
                  {participant.name}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          {currentUserId === expense.paidBy._id && (onEdit || onDelete) && (
            <div className='flex gap-2 mt-3'>
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className='flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition flex items-center justify-center gap-1'
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(expense._id)}
                  className='flex-1 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition flex items-center justify-center gap-1'
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
