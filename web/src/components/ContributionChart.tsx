import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ContributionData {
  name: string;
  amount: number;
}

interface ContributionChartProps {
  data: ContributionData[];
}

const COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#fa709a',
  '#fee140',
];

const ContributionChart: React.FC<ContributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className='w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg'>
        <p className='text-gray-500'>No expense data available</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-white rounded-lg shadow-md p-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>Contributions by Member</h3>
      <ResponsiveContainer width='100%' height={400}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({ name, amount }) => `${name}: $${amount.toFixed(2)}`}
            outerRadius={120}
            fill='#8884d8'
            dataKey='amount'
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContributionChart;
