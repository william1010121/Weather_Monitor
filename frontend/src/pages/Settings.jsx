import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUserSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      formal_name: user?.formal_name || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        formal_name: user.formal_name || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await updateUserSettings(data);
      setSuccessOpen(true);
      
      // Reset form dirty state
      reset(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error.response?.data?.detail || '更新設定失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/dashboard')}
          variant="outlined"
        >
          返回
        </Button>
        <Typography variant="h4">個人設定</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar
                  src={user.profile_picture}
                  sx={{ width: 64, height: 64 }}
                >
                  <PersonIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6">
                  {user.formal_name || user.display_name || user.google_name || '未設定'}
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                帳號類型: {user.is_admin ? '管理員' : '一般使用者'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                註冊時間: {new Date(user.created_at).toLocaleDateString('zh-TW')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              顯示設定
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              設定您的正式姓名，此名稱將顯示在儀表板和觀測紀錄中。
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Controller
                    name="formal_name"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 100,
                        message: '正式姓名不能超過100個字元'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="正式姓名"
                        placeholder="請輸入您的正式姓名"
                        fullWidth
                        error={!!errors.formal_name}
                        helperText={
                          errors.formal_name?.message ||
                          '此名稱將顯示在儀表板和觀測紀錄中，留空則使用 Google 帳號名稱'
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => reset()}
                      disabled={!isDirty || loading}
                    >
                      重置
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!isDirty || loading}
                      sx={{ minWidth: 120 }}
                    >
                      {loading ? '儲存中...' : '儲存設定'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              帳號資訊
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Google 帳號名稱
                </Typography>
                <Typography variant="body1">
                  {user.google_name || '未提供'}
                </Typography>
              </Grid>
              {user.display_name && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    管理員設定名稱
                  </Typography>
                  <Typography variant="body1">
                    {user.display_name}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          設定已成功更新！
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;