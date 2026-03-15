import { DollarSign, Plus, Users, Wallet } from 'lucide-react';
import React from 'react';

export type TabType = 'expenses' | 'add' | 'members' | 'balance';

interface GroupTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const GroupTabs: React.FC<GroupTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'expenses', label: 'Expenses', icon: <DollarSign size={20} /> },
    { id: 'add', label: 'Add', icon: <Plus size={20} /> },
    { id: 'members', label: 'Members', icon: <Users size={20} /> },
    { id: 'balance', label: 'Balance', icon: <Wallet size={20} /> },
  ];

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50'>
      <div className='max-w-6xl mx-auto flex items-center justify-around'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-2 transition ${activeTab === tab.id
                ? 'text-indigo-600 border-t-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            {tab.icon}
            <span className='text-xs font-medium mt-1'>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupTabs;
