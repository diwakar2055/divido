import { Mail, Search, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { groupsAPI } from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface InviteFormProps {
  groupId: string;
  currentMembers: any[];
  onInviteSuccess: () => void;
}

const InviteForm: React.FC<InviteFormProps> = ({ groupId, currentMembers, onInviteSuccess }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  const handleSearch = async (email: string) => {
    setSearchEmail(email);
    
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      console.log('[InviteForm] Searching for:', email);
      const res = await groupsAPI.searchUsers(email);
      
      console.log('[InviteForm] Full response:', res);
      console.log('[InviteForm] Response data:', res.data);
      console.log('[InviteForm] Response users:', res.data.users);
      
      if (!res.data.users || !Array.isArray(res.data.users)) {
        console.error('[InviteForm] Users is not an array:', res.data.users);
        toast.error('Unexpected response format from server');
        setSearchResults([]);
        return;
      }
      
      console.log('[InviteForm] Total users from server:', res.data.users.length);
      
      // Get current member IDs - be very careful about ID comparison
      const currentMemberIds = currentMembers.map(m => {
        const id = m._id || m.id;
        console.log('[InviteForm] Current member:', m.name, 'ID:', id);
        return id ? id.toString() : '';
      });
      console.log('[InviteForm] Current member IDs:', currentMemberIds);
      
      // Filter out existing members
      const filteredUsers = res.data.users.filter((user: User) => {
        const userId = (user._id || '').toString();
        const isAlreadyMember = currentMemberIds.includes(userId);
        console.log('[InviteForm] User:', user.email, 'ID:', userId, 'Already member?:', isAlreadyMember);
        return !isAlreadyMember;
      });
      console.log('[InviteForm] Final filtered users:', filteredUsers);
      setSearchResults(filteredUsers);
    } catch (error: any) {
      console.error('[InviteForm] Search error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userId: string) => {
    try {
      setInviting(userId);
      const user = searchResults.find(u => u._id === userId);
      
      await groupsAPI.inviteUser(groupId, user!.email);
      toast.success(`Invited ${user!.name} to the group`);
      
      setSearchEmail('');
      setSearchResults([]);
      onInviteSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviting(null);
    }
  };

  return (
    <div>
      {!showInvite ? (
        <button
          onClick={() => setShowInvite(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <UserPlus size={20} />
          Invite Members
        </button>
      ) : (
        <div className="bg-white border border-indigo-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Invite Members</h3>
            <button
              onClick={() => {
                setShowInvite(false);
                setSearchEmail('');
                setSearchResults([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {searching && <Search size={18} className="text-gray-400 animate-spin" />}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleInvite(user._id)}
                    disabled={inviting === user._id}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                  >
                    {inviting === user._id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Inviting...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Invite
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchEmail && searchResults.length === 0 && !searching && (
            <p className="text-center text-gray-500 text-sm py-2">
              No users found with that email
            </p>
          )}

          {!searchEmail && searchResults.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-2">
              Start typing an email to search for users
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InviteForm;
