import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import {
  Thermostat,
  WaterDrop,
  Cloud,
  Person,
  Schedule,
  Opacity,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { observationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardCard = ({ title, value, unit, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value !== null && value !== undefined ? (
          <>
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && (
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                {unit}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="h6" color="text.secondary">
            無資料
          </Typography>
        )}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await observationsAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404) {
        setError('尚無觀測資料，請先新增觀測紀錄。');
      } else {
        setError(error.response?.data?.detail || '載入資料失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        
        {dashboardData && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Chip
              icon={<Schedule />}
              label={dayjs(dashboardData.observation_time).format('YYYY-MM-DD HH:mm')}
              color="primary"
              variant="outlined"
            />
            {dashboardData.observer_name && (
              <Chip
                icon={<Person />}
                label={dashboardData.observer_name}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Temperature */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title={t('dashboard.temperature')}
            value={dashboardData?.temperature}
            unit="°C"
            icon={<Thermostat />}
            color="error"
          />
        </Grid>

        {/* Wet Bulb Temperature */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title={t('dashboard.wetBulbTemperature')}
            value={dashboardData?.wet_bulb_temperature}
            unit="°C"
            icon={<Thermostat />}
            color="warning"
          />
        </Grid>

        {/* 24h Precipitation */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title={t('dashboard.precipitation24h')}
            value={dashboardData?.precipitation_24h}
            unit="mm"
            icon={<WaterDrop />}
            color="info"
          />
        </Grid>

        {/* Evaporation Level */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title={t('dashboard.evaporationLevel')}
            value={dashboardData?.current_evaporation_level}
            unit="mm"
            icon={<Opacity />}
            color="primary"
          />
        </Grid>

        {/* Evaporation Temperature */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title={t('dashboard.evaporationTemp')}
            value={dashboardData?.evaporation_pan_temp}
            unit="°C"
            icon={<Thermostat />}
            color="success"
          />
        </Grid>

        {/* Observation Time as a separate card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    mr: 2,
                  }}
                >
                  <Schedule />
                </Box>
                <Typography variant="h6" component="div">
                  {t('dashboard.observationTime')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {dashboardData?.observation_time 
                  ? dayjs(dashboardData.observation_time).format('YYYY年MM月DD日')
                  : '無資料'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData?.observation_time 
                  ? dayjs(dashboardData.observation_time).format('HH:mm')
                  : ''
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Information */}
      {dashboardData && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  資料說明
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  以上資料為最新一筆觀測紀錄。24小時雨量為過去24小時內所有觀測紀錄的降水量總和。
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  觀測時間：{dayjs(dashboardData.observation_time).format('YYYY年MM月DD日 HH:mm')}
                </Typography>
                {dashboardData.observer_name && (
                  <Typography variant="body2" color="text.secondary">
                    觀測人員：{dashboardData.observer_name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;