import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token from URL (from backend redirect)
      localStorage.setItem('access_token', token);
      // Redirect to dashboard
      navigate('/dashboard');
    } else if (isAuthenticated) {
      // Already authenticated, redirect to dashboard
      navigate('/dashboard');
    } else {
      // No token and not authenticated, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, isAuthenticated]);

  return <LoadingSpinner message="正在處理登入..." />;
};

export default AuthCallback;