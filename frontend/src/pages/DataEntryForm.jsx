import React, { useState } from 'react';
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
  Checkbox,
  FormControlLabel,
  Collapse,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { observationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DataEntryForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      observation_time: dayjs(),
      temperature: '',
      wet_bulb_temperature: '',
      precipitation: '',
      evaporation_pan_temp: '',
      current_evaporation_level: '',
      current_weather_code: '',
      total_cloud_amount: '',
      high_cloud_type_code: '',
      high_cloud_amount: '',
      middle_cloud_type_code: '',
      middle_cloud_amount: '',
      low_cloud_type_code: '',
      low_cloud_amount: '',
      has_cleaned_evaporation_pan: false,
      cleaned_evaporation_level: '',
      cleaned_evaporation_temp: '',
      has_added_evaporation_water: false,
      added_evaporation_level: '',
      added_evaporation_temp: '',
      has_reduced_evaporation_water: false,
      reduced_evaporation_level: '',
      reduced_evaporation_temp: '',
      notes: '',
    },
  });

  // Watch checkbox values to control conditional sections
  const watchCleanedPan = watch('has_cleaned_evaporation_pan');
  const watchAddedWater = watch('has_added_evaporation_water');
  const watchReducedWater = watch('has_reduced_evaporation_water');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Convert empty strings to null for numeric fields
      const processedData = {
        ...data,
        observation_time: data.observation_time.toISOString(),
        temperature: data.temperature === '' ? null : parseFloat(data.temperature),
        wet_bulb_temperature: data.wet_bulb_temperature === '' ? null : parseFloat(data.wet_bulb_temperature),
        precipitation: data.precipitation === '' ? null : parseFloat(data.precipitation),
        evaporation_pan_temp: data.evaporation_pan_temp === '' ? null : parseFloat(data.evaporation_pan_temp),
        current_evaporation_level: data.current_evaporation_level === '' ? null : parseFloat(data.current_evaporation_level),
        total_cloud_amount: data.total_cloud_amount === '' ? null : parseInt(data.total_cloud_amount),
        high_cloud_type_code: data.high_cloud_type_code === '' ? null : parseInt(data.high_cloud_type_code),
        high_cloud_amount: data.high_cloud_amount === '' ? null : parseInt(data.high_cloud_amount),
        middle_cloud_type_code: data.middle_cloud_type_code === '' ? null : parseInt(data.middle_cloud_type_code),
        middle_cloud_amount: data.middle_cloud_amount === '' ? null : parseInt(data.middle_cloud_amount),
        low_cloud_type_code: data.low_cloud_type_code === '' ? null : parseInt(data.low_cloud_type_code),
        low_cloud_amount: data.low_cloud_amount === '' ? null : parseInt(data.low_cloud_amount),
        cleaned_evaporation_level: data.cleaned_evaporation_level === '' ? null : parseFloat(data.cleaned_evaporation_level),
        cleaned_evaporation_temp: data.cleaned_evaporation_temp === '' ? null : parseFloat(data.cleaned_evaporation_temp),
        added_evaporation_level: data.added_evaporation_level === '' ? null : parseFloat(data.added_evaporation_level),
        added_evaporation_temp: data.added_evaporation_temp === '' ? null : parseFloat(data.added_evaporation_temp),
        reduced_evaporation_level: data.reduced_evaporation_level === '' ? null : parseFloat(data.reduced_evaporation_level),
        reduced_evaporation_temp: data.reduced_evaporation_temp === '' ? null : parseFloat(data.reduced_evaporation_temp),
      };

      await observationsAPI.createObservation(processedData);
      setSuccessOpen(true);
      
      // Navigate to observations list after success
      setTimeout(() => {
        navigate('/observations');
      }, 1500);
    } catch (error) {
      console.error('Error creating observation:', error);
      setError(error.response?.data?.detail || t('observation.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/observations')}
          variant="outlined"
        >
          {t('app.back')}
        </Button>
        <Typography variant="h4">{t('observation.create')}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                基本資訊
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="observation_time"
                    control={control}
                    rules={{ required: t('validation.required') }}
                    render={({ field }) => (
                      <DateTimePicker
                        label={t('observation.observationTime')}
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            error: !!errors.observation_time,
                            helperText: errors.observation_time?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('observation.observer')}
                    value={user?.display_name || user?.google_name || ''}
                    disabled
                    helperText="自動從登入帳號帶入"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Temperature and Precipitation */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                溫度與降水
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="temperature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.temperature')}
                        type="number"
                        inputProps={{ step: 0.1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="wet_bulb_temperature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.wetBulbTemperature')}
                        type="number"
                        inputProps={{ step: 0.1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="precipitation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.precipitation')}
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Evaporation Pan */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                蒸發皿資料
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="evaporation_pan_temp"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.evaporationPanTemp')}
                        type="number"
                        inputProps={{ step: 0.1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="current_evaporation_level"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.currentEvaporationLevel')}
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Weather and Clouds */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                天氣與雲況
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="current_weather_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.currentWeatherCode')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="total_cloud_amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.totalCloudAmount')}
                        type="number"
                        inputProps={{ min: 0, max: 8 }}
                      />
                    )}
                  />
                </Grid>
                
                {/* High Clouds */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="high_cloud_type_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.highCloudTypeCode')}
                        type="number"
                        inputProps={{ min: 0, max: 9 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="high_cloud_amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.highCloudAmount')}
                        type="number"
                        inputProps={{ min: 0, max: 8 }}
                      />
                    )}
                  />
                </Grid>
                
                {/* Middle Clouds */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="middle_cloud_type_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.middleCloudTypeCode')}
                        type="number"
                        inputProps={{ min: 0, max: 9 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="middle_cloud_amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.middleCloudAmount')}
                        type="number"
                        inputProps={{ min: 0, max: 8 }}
                      />
                    )}
                  />
                </Grid>
                
                {/* Low Clouds */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="low_cloud_type_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.lowCloudTypeCode')}
                        type="number"
                        inputProps={{ min: 0, max: 9 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="low_cloud_amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('observation.lowCloudAmount')}
                        type="number"
                        inputProps={{ min: 0, max: 8 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Conditional Data Sections */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('observation.conditionalData')}
              </Typography>
              
              {/* Cleaned Evaporation Pan */}
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title={
                    <Controller
                      name="has_cleaned_evaporation_pan"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={t('observation.cleanedEvaporationData')}
                        />
                      )}
                    />
                  }
                />
                <Collapse in={watchCleanedPan}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="cleaned_evaporation_level"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.cleanedEvaporationLevel')}
                              type="number"
                              inputProps={{ step: 0.1, min: 0 }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="cleaned_evaporation_temp"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.cleanedEvaporationTemp')}
                              type="number"
                              inputProps={{ step: 0.1 }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>

              {/* Added Evaporation Water */}
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title={
                    <Controller
                      name="has_added_evaporation_water"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={t('observation.addedEvaporationData')}
                        />
                      )}
                    />
                  }
                />
                <Collapse in={watchAddedWater}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="added_evaporation_level"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.addedEvaporationLevel')}
                              type="number"
                              inputProps={{ step: 0.1, min: 0 }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="added_evaporation_temp"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.addedEvaporationTemp')}
                              type="number"
                              inputProps={{ step: 0.1 }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>

              {/* Reduced Evaporation Water */}
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title={
                    <Controller
                      name="has_reduced_evaporation_water"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={t('observation.reducedEvaporationData')}
                        />
                      )}
                    />
                  }
                />
                <Collapse in={watchReducedWater}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="reduced_evaporation_level"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.reducedEvaporationLevel')}
                              type="number"
                              inputProps={{ step: 0.1, min: 0 }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="reduced_evaporation_temp"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('observation.reducedEvaporationTemp')}
                              type="number"
                              inputProps={{ step: 0.1 }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('observation.notes')}
              </Typography>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={4}
                    placeholder="請輸入觀測備註..."
                  />
                )}
              />
            </Paper>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? t('app.loading') : t('app.submit')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          {t('observation.created')}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DataEntryForm;