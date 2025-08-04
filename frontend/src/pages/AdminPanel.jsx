import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.detail || '載入使用者列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditDialog({ open: true, user });
    setDisplayName(user.display_name || '');
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, user: null });
    setDisplayName('');
  };

  const handleSaveUser = async () => {
    try {
      await userAPI.updateUser(editDialog.user.id, {
        display_name: displayName || null,
      });
      handleCloseEditDialog();
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      alert('更新使用者失敗');
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      if (isAdmin) {
        await userAPI.removeAdmin(userId);
      } else {
        await userAPI.makeAdmin(userId);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('更新管理員權限失敗');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await userAPI.deactivateUser(userId);
      } else {
        await userAPI.activateUser(userId);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('更新使用者狀態失敗');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('user.title')}</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
        >
          重新整理
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('user.email')}</TableCell>
              <TableCell>{t('user.displayName')}</TableCell>
              <TableCell>{t('user.googleName')}</TableCell>
              <TableCell>{t('user.isAdmin')}</TableCell>
              <TableCell>{t('user.isActive')}</TableCell>
              <TableCell>{t('user.createdAt')}</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.display_name ? (
                    <Typography variant="body2">{user.display_name}</Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      未設定
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{user.google_name}</TableCell>
                <TableCell>
                  <Chip
                    label={user.is_admin ? '是' : '否'}
                    color={user.is_admin ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? '啟用' : '停用'}
                    color={user.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {dayjs(user.created_at).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditUser(user)}
                      title="編輯顯示名稱"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={user.is_admin ? 'error' : 'success'}
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      title={user.is_admin ? '移除管理員權限' : '設為管理員'}
                    >
                      {user.is_admin ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color={user.is_active ? 'warning' : 'success'}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      title={user.is_active ? '停用使用者' : '啟用使用者'}
                    >
                      {user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          目前沒有註冊的使用者。
        </Alert>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>編輯使用者</DialogTitle>
        <DialogContent>
          {editDialog.user && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {editDialog.user.email}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label={t('user.displayName')}
                fullWidth
                variant="outlined"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                helperText="設定使用者的英文顯示名稱，用於觀測紀錄中顯示"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Google 名稱：{editDialog.user.google_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>取消</Button>
          <Button onClick={handleSaveUser} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;