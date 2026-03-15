import { CheckCircle, Loader, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { groupsAPI } from '../utils/api';
import useStore from '../utils/store';

const JoinGroupPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for store to hydrate if necessary
    if (user === null) {
      // Logic for not logged in
      sessionStorage.setItem('invitationToken', token || '');
      navigate('/login');
      return;
    }

    if (user) {
      acceptInvitation();
    }
  }, [token, user]);

  const acceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await groupsAPI.acceptInvitation(token);
      setGroupName(response.data.group.name);
      setSuccess(true);
      toast.success('Successfully joined the group!');

      // Redirect to group details after 2 seconds
      setTimeout(() => {
        navigate(`/group/${response.data.group._id}`);
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to join group. The invitation may have expired.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4'>
      <div className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center'>
        <div className='w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4'>
          D
        </div>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Divido</h1>

        {loading && (
          <>
            <div className='mt-8 mb-8'>
              <Loader size={48} className='animate-spin text-purple-600 mx-auto' />
            </div>
            <p className='text-gray-600'>Processing your invitation...</p>
          </>
        )}

        {success && (
          <>
            <div className='mt-8 mb-8'>
              <CheckCircle size={48} className='text-green-500 mx-auto' />
            </div>
            <p className='text-gray-800 mb-2'>
              Welcome to <strong>{groupName}</strong>!
            </p>
            <p style={{ color: '#4b5563', marginBottom: '24px' }}>You've successfully joined the group.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/group/${token}`)} // Fallback if groupRes somehow failed but success is true
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition"
              >
                Go to Group
              </button>
            </div>
            <p className='text-sm text-gray-500 mt-4'>Redirecting automatically in 2 seconds...</p>
          </>
        )}

        {error && (
          <>
            <div className='mt-8 mb-8'>
              <XCircle size={48} className='text-red-500 mx-auto' />
            </div>
            <p className='text-gray-800 mb-2'>Unable to Join Group</p>
            <p className='text-gray-600 mb-6'>{error}</p>
            <div className='flex flex-col gap-3'>
              <button
                onClick={() => navigate('/dashboard')}
                className='bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition'
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/login')}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition'
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGroupPage;
