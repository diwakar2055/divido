import { User, X } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { groupsAPI } from '../utils/api';

interface Member {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface MembersListProps {
  members: Member[];
  groupId: string;
  isCreator: boolean;
  onMemberRemoved: () => void;
}

const MembersList: React.FC<MembersListProps> = ({ members, groupId, isCreator, onMemberRemoved }) => {
  const [removing, setRemoving] = React.useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the group?')) return;

    try {
      setRemoving(userId);
      await groupsAPI.removeMember(groupId, userId);
      toast.success('Member removed successfully');
      onMemberRemoved();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
      <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4'>
        <User size={20} />
        Members ({members.length})
      </h3>
      
      <div className='space-y-2'>
        {members.map((member) => (
          <div
            key={member._id || member.id}
            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'
          >
            <div>
              <p className='font-medium text-gray-800'>{member.name}</p>
              <p className='text-xs text-gray-500'>{member.email}</p>
            </div>
            {isCreator && (
              <button
                onClick={() => handleRemove(member._id || member.id || '')}
                disabled={removing === (member._id || member.id)}
                className='text-red-500 hover:text-red-700 disabled:text-gray-400 transition'
                title='Remove member'
              >
                {removing === (member._id || member.id) ? (
                  <span className='animate-spin'>⏳</span>
                ) : (
                  <X size={18} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;
