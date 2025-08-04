import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  List as ListIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: t('navigation.dashboard'),
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: t('navigation.dataEntry'),
      path: '/data-entry',
      icon: <AddIcon />,
    },
    {
      label: t('navigation.observations'),
      path: '/observations',
      icon: <ListIcon />,
    },
  ];

  if (isAdmin) {
    navigationItems.push({
      label: t('navigation.admin'),
      path: '/admin',
      icon: <AdminIcon />,
    });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          {t('app.title')}
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mr: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {user?.profile_picture ? (
              <Avatar
                src={user.profile_picture}
                alt={user.formal_name || user.display_name || user.google_name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {user?.formal_name || user?.display_name || user?.google_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
                {isAdmin && (
                  <Typography variant="caption" color="primary" display="block">
                    {t('user.isAdmin')}
                  </Typography>
                )}
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              個人設定
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              {t('auth.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;