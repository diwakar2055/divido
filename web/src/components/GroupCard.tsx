import { ChevronRight, User } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  totalBalance?: number;
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  description,
  memberCount,
  totalBalance,
}) => {
  return (
    <Link to={`/group/${id}`}>
      <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>{name}</h3>
            {description && (
              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{description}</p>
            )}
            <div className='flex items-center gap-4 text-sm text-gray-500'>
              <span className='flex items-center gap-1'>
                <User size={16} />
                {memberCount} members
              </span>
            </div>
          </div>
          <div className='text-right'>
            {totalBalance !== undefined && (
              <div className={`text-lg font-bold ${totalBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance > 0 ? '+' : ''} ${Math.abs(totalBalance).toFixed(2)}
              </div>
            )}
            <ChevronRight size={20} className='text-gray-400 mt-4' />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
