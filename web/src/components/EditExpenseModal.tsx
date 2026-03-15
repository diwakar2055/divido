import { X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  paidBy: { name: string; _id: string };
  participants: { name: string; _id: string }[];
  excludedMembers?: { name: string; _id: string }[];
}

interface Member {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface EditExpenseModalProps {
  expense: Expense;
  members: Member[];
  onSave: (expenseId: string, data: any) => Promise<void>;
  onCancel: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  members,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount.toString(),
    paidBy: expense.paidBy._id,
    participants: expense.participants.map(p => p._id),
  });
  const [saving, setSaving] = useState(false);

  const handleToggleParticipant = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(memberId)
        ? prev.participants.filter(id => id !== memberId)
        : [...prev.participants, memberId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.amount) {
      toast.error('Title and amount are required');
      return;
    }

    try {
      setSaving(true);
      await onSave(expense._id, {
        title: formData.title,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        participants: formData.participants,
      });
      onCancel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-bold text-gray-800'>Edit Expense</h2>
          <button
            onClick={onCancel}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              placeholder='e.g., Dinner'
            />
          </div>

          {/* Amount */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Amount
            </label>
            <input
              type='number'
              step='0.01'
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              placeholder='0.00'
            />
          </div>

          {/* Paid By */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Paid By
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) =>
                setFormData({ ...formData, paidBy: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            >
              {members.map((member) => (
                <option key={member._id || member.id} value={member._id || member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Who is included?
            </label>
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {members.map((member) => (
                <label
                  key={member._id || member.id}
                  className='flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded'
                >
                  <input
                    type='checkbox'
                    checked={formData.participants.includes(member._id || member.id || '')}
                    onChange={() =>
                      handleToggleParticipant(member._id || member.id || '')
                    }
                    className='w-4 h-4 text-indigo-600'
                  />
                  <span className='text-gray-700'>{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg transition'
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
