import { GoogleLogin } from '@react-oauth/google';
import { Loader, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import useStore from '../utils/store';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleKey, setGoogleKey] = useState(Date.now());
  const { setUser } = useStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Force remount of the Google button on navigation to avoid vanishing bug
    setGoogleKey(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.data.user);
      toast.success('Login successful!');

      const inviteToken = sessionStorage.getItem('invitationToken');
      if (inviteToken) {
        sessionStorage.removeItem('invitationToken');
        navigate(`/join-group/${inviteToken}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const response = await authAPI.loginWithGoogle({ token: credentialResponse.credential });
      setUser(response.data.user);
      toast.success('Login with Google successful!');

      const inviteToken = sessionStorage.getItem('invitationToken');
      if (inviteToken) {
        sessionStorage.removeItem('invitationToken');
        navigate(`/join-group/${inviteToken}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4'>
      <div className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4'>
            D
          </div>
          <h1 className='text-3xl font-bold text-gray-800'>Divido</h1>
          <p className='text-gray-600 mt-2'>Split expenses effortlessly</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
            <div className='relative'>
              <Mail size={18} className='absolute left-3 top-3 text-gray-400' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                placeholder='your@email.com'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <div className='relative'>
              <Lock size={18} className='absolute left-3 top-3 text-gray-400' />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent'
                placeholder='••••••••'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {loading && <Loader size={18} className='animate-spin' />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>Or login with Google</span>
          </div>
        </div>

        {/* Google Login Button */}
        <div className='flex justify-center mb-6'>
          <GoogleLogin
            key={googleKey}
            onSuccess={handleGoogleLogin}
            onError={() => toast.error('Google login failed')}
            size='large'
            theme='outline'
          />
        </div>

        <p className='text-center text-gray-600 mt-6'>
          Don't have an account?{' '}
          <a href='/signup' className='text-purple-600 font-semibold hover:underline'>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
