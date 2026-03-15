import { Check, Home, Loader, LogOut, Mail, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import Header from '../components/Header';
import { authAPI, groupsAPI } from '../utils/api';
import useStore from '../utils/store';

interface CreateGroupForm {
  name: string;
  description: string;
}

interface PendingInvitation {
  _id: string;
  token: string;
  groupId: { _id: string; name: string; description?: string };
  createdBy: { _id: string; name: string; email: string };
  expiresAt: string;
}

const Dashboard: React.FC = () => {
  const { user, groups, setGroups } = useStore();
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [formData, setFormData] = useState<CreateGroupForm>({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGroups();
    fetchPendingInvitations();
  }, [user, navigate]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getGroups();
      setGroups(response.data.groups);
    } catch (error: any) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const response = await groupsAPI.getPendingInvitations();
      setPendingInvitations(response.data.invitations);
    } catch (error: any) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    try {
      await groupsAPI.acceptInvitation(token);
      toast.success('Successfully joined the group!');
      setPendingInvitations(prev => prev.filter(inv => inv.token !== token));
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const response = await groupsAPI.createGroup(formData);
      setGroups([response.data.group, ...groups]);
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      toast.success('Group created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8 px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-4xl font-bold text-gray-800'>Welcome, {user?.name}!</h1>
              <p className='text-gray-600 mt-2'>Manage your expense groups and balances</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center gap-2'
            >
              <Plus size={20} />
              <span className='hidden sm:inline'>New Group</span>
            </button>
          </div>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <Mail size={20} className='text-purple-600' />
                Pending Invitations ({pendingInvitations.length})
              </h2>
              <div className='space-y-3'>
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className='bg-white rounded-lg shadow-md p-4 flex items-center justify-between border-l-4 border-purple-600'
                  >
                    <div>
                      <p className='font-semibold text-gray-800'>
                        {invitation.groupId?.name || 'Unknown Group'}
                      </p>
                      <p className='text-sm text-gray-500'>
                        Invited by {invitation.createdBy?.name || 'Unknown'} • Expires{' '}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleAcceptInvitation(invitation.token)}
                        className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-1 text-sm font-medium'
                      >
                        <Check size={16} />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
              <h2 className='text-xl font-semibold text-gray-800 mb-4'>Create New Group</h2>
              <form onSubmit={handleCreateGroup} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Group Name
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                    placeholder='e.g., Apartment, Vacation'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                    placeholder='Add any details about this group'
                    rows={3}
                  />
                </div>

                <div className='flex gap-4'>
                  <button
                    type='submit'
                    className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition'
                  >
                    Create Group
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowCreateForm(false)}
                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <Loader size={40} className='animate-spin text-purple-600' />
            </div>
          ) : groups.length === 0 ? (
            <div className='bg-white rounded-lg shadow-md p-12 text-center'>
              <p className='text-gray-500 text-lg'>No groups yet. Create your first group!</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {groups.map((group) => (
                <GroupCard
                  key={group._id}
                  id={group._id}
                  name={group.name}
                  description={group.description}
                  memberCount={group.members.length}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50'>
        <div className='flex justify-around items-center py-2'>
          <button
            className='flex flex-col items-center gap-1 px-4 py-2 text-purple-600'
          >
            <Home size={20} />
            <span className='text-xs font-medium'>Home</span>
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className='flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-purple-600 transition'
          >
            <Plus size={20} />
            <span className='text-xs font-medium'>New Group</span>
          </button>
          <button
            onClick={async () => {
              try { await authAPI.logout(); } catch (e) { }
              useStore.getState().logout();
              navigate('/login');
            }}
            className='flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-red-500 transition'
          >
            <LogOut size={20} />
            <span className='text-xs font-medium'>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
