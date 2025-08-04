import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
  TextField,
  Divider,
  Link,
} from '@mui/material';
import { Google as GoogleIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, adminLogin, isAuthenticated, loading } = useAuth();
  const [error, setError] = React.useState('');
  const [isLogging, setIsLogging] = React.useState(false);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminCredentials, setAdminCredentials] = React.useState({
    username: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLogging(true);
      setError('');
      
      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await userInfoResponse.json();

        // Send user info to our backend
        const result = await login({
          google_id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        });

        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || t('auth.loginFailed'));
        }
      } catch (error) {
        console.error('Login error:', error);
        setError(t('auth.loginFailed'));
      } finally {
        setIsLogging(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError(t('auth.loginFailed'));
      setIsLogging(false);
    },
    scope: 'openid email profile',
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setError('');

    try {
      const result = await adminLogin(adminCredentials);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Admin login failed');
    } finally {
      setIsLogging(false);
    }
  };

  const handleInputChange = (e) => {
    setAdminCredentials({
      ...adminCredentials,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom align="center">
            {t('app.title')}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom align="center">
            {t('auth.loginRequired')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {!showAdminLogin ? (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={() => googleLogin()}
                disabled={isLogging}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#4285f4',
                  '&:hover': {
                    backgroundColor: '#357ae8',
                  },
                }}
              >
                {isLogging ? t('app.loading') : t('auth.loginWithGoogle')}
              </Button>

              <Divider sx={{ my: 2 }}>or</Divider>

              <Link
                component="button"
                variant="body2"
                onClick={() => setShowAdminLogin(true)}
                sx={{ mb: 2 }}
              >
                管理員登入 (Admin Login)
              </Link>

              <Typography variant="body2" color="text.secondary" align="center">
                使用您的 Google 帳號登入以開始記錄氣象觀測資料
              </Typography>
            </>
          ) : (
            <Box component="form" onSubmit={handleAdminLogin} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={adminCredentials.username}
                onChange={handleInputChange}
                disabled={isLogging}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={adminCredentials.password}
                onChange={handleInputChange}
                disabled={isLogging}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AdminIcon />}
                disabled={isLogging}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                }}
              >
                {isLogging ? 'Logging in...' : 'Admin Login'}
              </Button>
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowAdminLogin(false)}
              >
                ← Back to Google Login
              </Link>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;