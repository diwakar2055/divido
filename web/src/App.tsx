import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import GroupDetailsPage from './pages/GroupDetailsPage';
import JoinGroupPage from './pages/JoinGroupPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './styles/index.css';
import useStore from './utils/store';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string || 'YOUR_GOOGLE_CLIENT_ID';
console.log('Google Client ID:', GOOGLE_CLIENT_ID);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useStore();
  return user ? <>{children}</> : <Navigate to='/login' />;
};

function App() {
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Prevent recursion from our own tab's setUser logic 
      // StorageEvent only fires on other tabs, but we sync them
      if (e.key === 'user') {
        const currentUser = useStore.getState().user;
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        if (JSON.stringify(currentUser) !== JSON.stringify(newUser)) {
          useStore.getState().setUser(newUser);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <Router>
          <Toaster position='top-right' />
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/join-group/:token' element={<JoinGroupPage />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/group/:groupId'
              element={
                <ProtectedRoute>
                  <GroupDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route path='/' element={<Navigate to='/dashboard' />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;
