import { ArrowLeft, DollarSign, Edit2, Loader, Plus, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import BalanceSummary from '../components/BalanceSummary';
import ContributionChart from '../components/ContributionChart';
import EditExpenseModal from '../components/EditExpenseModal';
import EditGroupModal from '../components/EditGroupModal';
import ExpenseList from '../components/ExpenseList';
import GroupTabs, { TabType } from '../components/GroupTabs';
import Header from '../components/Header';
import InviteForm from '../components/InviteForm';
import MembersList from '../components/MembersList';
import { expensesAPI, groupsAPI } from '../utils/api';
import useStore from '../utils/store';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  paidBy: { name: string; _id: string };
  participants: { name: string; _id: string }[];
  excludedMembers?: { name: string; _id: string }[];
  createdAt: string;
}

interface Balance {
  userId: string;
  name: string;
  paid: number;
  spent: number;
  balance: number;
}

interface Contribution {
  name: string;
  amount: number;
}

const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, currentGroup, setCurrentGroup } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    participants: [] as string[],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !groupId) {
      navigate('/login');
      return;
    }
    fetchGroupData();
  }, [groupId, user, navigate]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupsAPI.getGroup(groupId!);
      setCurrentGroup(groupRes.data.group);

      const expensesRes = await expensesAPI.getExpenses(groupId!);
      setExpenses(expensesRes.data.expenses);

      const balancesRes = await expensesAPI.getBalances(groupId!);
      setBalances(balancesRes.data.balances);
      setContributions(balancesRes.data.contributions);
    } catch (error: any) {
      toast.error('Failed to load group data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseForm.title.trim() || !expenseForm.amount) {
      toast.error('Title and amount are required');
      return;
    }

    const selectedParticipants =
      expenseForm.participants.length > 0
        ? expenseForm.participants
        : currentGroup?.members.map((m: any) => m._id) || [];

    try {
      const response = await expensesAPI.createExpense({
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        groupId: groupId!,
        participants: selectedParticipants,
      });

      setExpenses([response.data.expense, ...expenses]);
      setExpenseForm({ title: '', amount: '', participants: [] });
      await fetchGroupData(); // Refresh balances
      toast.success('Expense added successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter((e) => e._id !== expenseId));
      await fetchGroupData(); // Refresh balances
      toast.success('Expense deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete expense');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? All expenses will also be permanently deleted.')) return;

    try {
      await groupsAPI.deleteGroup(groupId!);
      toast.success('Group deleted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to delete group');
    }
  };

  const handleEditGroup = async (name: string, description: string) => {
    try {
      const response = await groupsAPI.updateGroup(groupId!, { name, description });
      setCurrentGroup(response.data.group);
      setShowEditGroup(false);
      toast.success('Group updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update group');
    }
  };

  const handleEditExpense = async (expenseId: string, updatedData: { title: string; amount: number; participants: string[] }) => {
    try {
      const response = await expensesAPI.updateExpense(expenseId, updatedData);
      setExpenses(expenses.map(e => e._id === expenseId ? response.data.expense : e));
      setEditingExpense(null);
      await fetchGroupData(); // Refresh balances
      toast.success('Expense updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className='flex items-center justify-center h-screen'>
          <Loader size={40} className='animate-spin text-purple-600' />
        </div>
      </>
    );
  }

  const isCreator = typeof currentGroup?.createdBy === 'string'
    ? currentGroup.createdBy === user?._id || currentGroup.createdBy === user?.id
    : currentGroup?.createdBy?._id === user?._id || currentGroup?.createdBy?._id === user?.id;

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 pb-24 md:pb-8'>
        <div className='max-w-6xl mx-auto px-4 py-8'>
          <button
            onClick={() => navigate('/dashboard')}
            className='flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 transition'
          >
            <ArrowLeft size={20} />
            Back to Groups
          </button>

          <div className='bg-white rounded-lg shadow-md p-6 mb-8 relative'>
            <div className='flex justify-between items-start mb-2'>
              <div className='flex-1'>
                <h1 className='text-3xl font-bold text-gray-800 '>{currentGroup?.name}</h1>
              </div>
              {isCreator && (
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setShowEditGroup(true)}
                    className='p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition'
                    title='Edit Group'
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className='p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition'
                    title='Delete Group'
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {currentGroup?.description && (
              <p className='text-gray-600 mb-4'>{currentGroup.description}</p>
            )}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
              <div className='bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 text-blue-600 mb-2'>
                  <Users size={20} />
                  <span className='text-sm font-semibold'>Members</span>
                </div>
                <p className='text-2xl font-bold text-gray-800'>
                  {currentGroup?.members.length}
                </p>
              </div>

              <div className='bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 text-green-600 mb-2'>
                  <DollarSign size={20} />
                  <span className='text-sm font-semibold'>Total Spent</span>
                </div>
                <p className='text-2xl font-bold text-gray-800'>
                  ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </p>
              </div>

              <div className='bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-lg'>
                <div className='flex items-center gap-2 text-purple-600 mb-2'>
                  <DollarSign size={20} />
                  <span className='text-sm font-semibold'>Expenses</span>
                </div>
                <p className='text-2xl font-bold text-gray-800'>{expenses.length}</p>
              </div>
            </div>
          </div>

          {/* Mobile and Desktop Tab Navigation */}
          <div className='mb-6'>
            <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className='space-y-6'>
            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h2 className='text-xl font-semibold text-gray-800 mb-4'>Expenses</h2>
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                  onEdit={(expense) => setEditingExpense(expense)}
                  currentUserId={user?._id || user?.id}
                />
              </div>
            )}

            {/* Add Expense Tab */}
            {activeTab === 'add' && (
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h2 className='text-xl font-semibold text-gray-800 mb-4'>Add New Expense</h2>
                <form onSubmit={handleAddExpense} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description
                    </label>
                    <input
                      type='text'
                      value={expenseForm.title}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, title: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                      placeholder='e.g., Dinner, Groceries'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Amount
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, amount: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                      placeholder='0.00'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Split Among
                    </label>
                    <div className='space-y-2 max-h-64 overflow-y-auto'>
                      {currentGroup?.members.map((member: any) => (
                        <label
                          key={member._id}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <input
                            type='checkbox'
                            checked={expenseForm.participants.includes(member._id)}
                            onChange={() => {
                              setExpenseForm((prev) => ({
                                ...prev,
                                participants: prev.participants.includes(member._id)
                                  ? prev.participants.filter((id) => id !== member._id)
                                  : [...prev.participants, member._id],
                              }));
                            }}
                            className='w-4 h-4 text-purple-600 rounded'
                          />
                          <span className='text-gray-700'>{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <button
                      type='submit'
                      className='flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium'
                    >
                      <Plus size={18} className='inline mr-2' />
                      Add Expense
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className='space-y-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <h2 className='text-xl font-semibold text-gray-800 mb-4'>Members</h2>
                  <MembersList
                    members={currentGroup?.members || []}
                    groupId={groupId!}
                    isCreator={typeof currentGroup?.createdBy === 'string'
                      ? currentGroup.createdBy === user?._id || currentGroup.createdBy === user?.id
                      : currentGroup?.createdBy._id === user?._id || currentGroup?.createdBy._id === user?.id}
                    onMemberRemoved={fetchGroupData}
                  />
                </div>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <InviteForm
                    groupId={groupId!}
                    currentMembers={currentGroup?.members || []}
                    onInviteSuccess={fetchGroupData}
                  />
                </div>
              </div>
            )}

            {/* Balance Tab */}
            {activeTab === 'balance' && (
              <div className='space-y-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <h2 className='text-xl font-semibold text-gray-800 mb-4'>Balances</h2>
                  <BalanceSummary balances={balances} />
                </div>
                {contributions.length > 0 && (
                  <ContributionChart data={contributions} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          members={currentGroup?.members || []}
          onSave={handleEditExpense}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      {/* Edit Group Modal */}
      {showEditGroup && currentGroup && (
        <EditGroupModal
          initialName={currentGroup.name}
          initialDescription={currentGroup.description || ''}
          onSave={handleEditGroup}
          onCancel={() => setShowEditGroup(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 md:hidden'>
        <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
};

export default GroupDetailsPage;
