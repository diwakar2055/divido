import React from 'react';

interface BalanceItem {
  userId: string;
  name: string;
  balance: number;
}

interface BalanceSummaryProps {
  balances: BalanceItem[];
  onSettle?: (from: string, to: string, amount: number) => void;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ balances }) => {
  if (!balances || balances.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6'>
        <p className='text-gray-500 text-center'>No balance data</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Balance Summary</h3>
      {balances.map((balance) => (
        <div
          key={balance.userId}
          className='bg-white rounded-lg shadow-md p-4 flex items-center justify-between'
        >
          <div>
            <p className='font-semibold text-gray-800'>{balance.name}</p>
            <p className='text-sm text-gray-500'>
              {balance.balance > 0 ? 'They owe you' : balance.balance < 0 ? 'You owe them' : 'Settled'}
            </p>
          </div>
          <div
            className={`text-2xl font-bold ${
              balance.balance > 0
                ? 'text-green-600'
                : balance.balance < 0
                  ? 'text-red-600'
                  : 'text-gray-400'
            }`}
          >
            {balance.balance > 0 ? '+' : ''} ${Math.abs(balance.balance).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BalanceSummary;
