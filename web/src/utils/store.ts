import { create } from 'zustand';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: User | string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  paidBy: User;
  groupId: string;
  participants: User[];
  excludedMembers: User[];
  createdAt: string;
  updatedAt: string;
}

interface Balance {
  userId: string;
  name: string;
  paid: number;
  spent: number;
  balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface Store {
  // Auth
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Groups
  groups: Group[];
  currentGroup: Group | null;
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;

  // Expenses
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;

  // Balances
  balances: Balance[];
  settlements: Settlement[];
  setBalances: (balances: Balance[]) => void;
  setSettlements: (settlements: Settlement[]) => void;
}

const useStore = create<Store>((set) => ({
  // Auth
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  isLoading: false,
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    set({
      user: null,
      groups: [],
      currentGroup: null,
      expenses: [],
      balances: [],
      settlements: [],
    });
    localStorage.removeItem('user');
  },

  // Groups
  groups: [],
  currentGroup: null,
  setGroups: (groups) => set({ groups }),
  setCurrentGroup: (group) => set({ currentGroup: group }),

  // Expenses
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),

  // Balances
  balances: [],
  settlements: [],
  setBalances: (balances) => set({ balances }),
  setSettlements: (settlements) => set({ settlements }),
}));

export default useStore;
