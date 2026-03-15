import { LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import useStore from '../utils/store';

const Header: React.FC = () => {
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className='bg-white shadow-md sticky top-0 z-40'>
      <div className='max-w-6xl mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold'>
              D
            </div>
            <span className='font-bold text-xl text-gray-800 hidden sm:inline'>Divido</span>
          </Link>

          <nav className='hidden md:flex items-center gap-8'>
            {user && (
              <>
                <Link to='/dashboard' className='text-gray-600 hover:text-gray-800 transition'>
                  Dashboard
                </Link>
                <Link to='/expenses' className='text-gray-600 hover:text-gray-800 transition'>
                  Expenses
                </Link>
                <span className='text-gray-600'>{user.name}</span>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition'
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className='md:hidden p-2'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className='md:hidden mt-4 flex flex-col gap-4 border-t pt-4'>
            {user && (
              <>
                <Link to='/dashboard' className='text-gray-600 hover:text-gray-800'>
                  Dashboard
                </Link>
                <Link to='/expenses' className='text-gray-600 hover:text-gray-800'>
                  Expenses
                </Link>
                <span className='text-gray-600'>{user.name}</span>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition'
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
