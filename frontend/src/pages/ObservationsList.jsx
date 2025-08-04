import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  Fab,
  Collapse,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { observationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ObservationsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchObservations();
  }, [page, rowsPerPage]);

  const fetchObservations = async () => {
    try {
      setLoading(true);
      const response = await observationsAPI.getObservations({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      });
      setObservations(response.data);
      // For now, we'll estimate total count. In a real app, the API should return total count
      setTotalCount(response.data.length === rowsPerPage ? (page + 2) * rowsPerPage : (page * rowsPerPage) + response.data.length);
    } catch (error) {
      console.error('Error fetching observations:', error);
      setError(error.response?.data?.detail || '載入觀測紀錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (observationId) => {
    if (!window.confirm('確定要刪除此觀測紀錄嗎？')) {
      return;
    }

    try {
      await observationsAPI.deleteObservation(observationId);
      fetchObservations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting observation:', error);
      alert('刪除觀測紀錄失敗');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (observationId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(observationId)) {
      newExpandedRows.delete(observationId);
    } else {
      newExpandedRows.add(observationId);
    }
    setExpandedRows(newExpandedRows);
  };

  const formatValue = (value, unit = '', decimals = 1) => {
    if (value != null && typeof value === 'number') {
      return `${value.toFixed(decimals)}${unit}`;
    }
    return '無資料';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('observation.list')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchObservations}
          >
            重新整理
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/data-entry')}
          >
            {t('observation.create')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {observations.length === 0 ? (
        <Alert severity="info">
          尚無觀測紀錄，請建立您的第一筆觀測資料。
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>展開</TableCell>
                  <TableCell>{t('observation.observationTime')}</TableCell>
                  <TableCell>{t('observation.temperature')}</TableCell>
                  <TableCell>{t('observation.wetBulbTemperature')}</TableCell>
                  <TableCell>{t('observation.precipitation')}</TableCell>
                  <TableCell>蒸發皿水位</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {observations.map((observation) => (
                  <React.Fragment key={observation.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(observation.id)}
                        >
                          {expandedRows.has(observation.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {dayjs(observation.observation_time).format('YYYY-MM-DD')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(observation.observation_time).format('HH:mm')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {observation.temperature != null && typeof observation.temperature === 'number' ? (
                          <Chip
                            label={`${observation.temperature.toFixed(1)}°C`}
                            color="error"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            無資料
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {observation.wet_bulb_temperature != null && typeof observation.wet_bulb_temperature === 'number' ? (
                          <Chip
                            label={`${observation.wet_bulb_temperature.toFixed(1)}°C`}
                            color="warning"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            無資料
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {observation.precipitation != null && typeof observation.precipitation === 'number' ? (
                          <Chip
                            label={`${observation.precipitation.toFixed(1)}mm`}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            無資料
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {observation.current_evaporation_level != null && typeof observation.current_evaporation_level === 'number' ? (
                          `${observation.current_evaporation_level.toFixed(1)}mm`
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            無資料
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/observations/${observation.id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(observation.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Content */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={expandedRows.has(observation.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              詳細觀測資料
                            </Typography>
                            <Grid container spacing={2}>
                              {/* Basic Information */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>基本資訊</Typography>
                                    <Typography variant="body2">觀測人員: {observation.observer_name || '無資料'}</Typography>
                                    <Typography variant="body2">觀測時間: {dayjs(observation.observation_time).format('YYYY-MM-DD HH:mm')}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Temperature Data */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>溫度資料</Typography>
                                    <Typography variant="body2">現在溫度: {formatValue(observation.temperature, '°C')}</Typography>
                                    <Typography variant="body2">濕球溫度: {formatValue(observation.wet_bulb_temperature, '°C')}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Evaporation Data */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>蒸發皿資料</Typography>
                                    <Typography variant="body2">蒸發皿水溫: {formatValue(observation.evaporation_pan_temp, '°C')}</Typography>
                                    <Typography variant="body2">現在水位高: {formatValue(observation.current_evaporation_level, 'mm')}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Weather Data */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>天氣資料</Typography>
                                    <Typography variant="body2">降水量: {formatValue(observation.precipitation, 'mm')}</Typography>
                                    <Typography variant="body2">現在天氣代碼: {observation.current_weather_code || '無資料'}</Typography>
                                    <Typography variant="body2">總雲量: {formatValue(observation.total_cloud_amount, '', 0)}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Cloud Data */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>雲況資料</Typography>
                                    <Typography variant="body2">高雲雲種代碼: {formatValue(observation.high_cloud_type_code, '', 0)}</Typography>
                                    <Typography variant="body2">高雲雲量: {formatValue(observation.high_cloud_amount, '', 0)}</Typography>
                                    <Typography variant="body2">中雲雲種代碼: {formatValue(observation.middle_cloud_type_code, '', 0)}</Typography>
                                    <Typography variant="body2">中雲雲量: {formatValue(observation.middle_cloud_amount, '', 0)}</Typography>
                                    <Typography variant="body2">低雲雲種代碼: {formatValue(observation.low_cloud_type_code, '', 0)}</Typography>
                                    <Typography variant="body2">低雲雲量: {formatValue(observation.low_cloud_amount, '', 0)}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Conditional Data */}
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>條件式資料</Typography>
                                    {observation.has_cleaned_evaporation_pan && (
                                      <>
                                        <Typography variant="body2">已洗蒸發皿</Typography>
                                        <Typography variant="body2">- 洗後水位: {formatValue(observation.cleaned_evaporation_level, 'mm')}</Typography>
                                        <Typography variant="body2">- 洗後水溫: {formatValue(observation.cleaned_evaporation_temp, '°C')}</Typography>
                                      </>
                                    )}
                                    {observation.has_added_evaporation_water && (
                                      <>
                                        <Typography variant="body2">已加蒸發皿水</Typography>
                                        <Typography variant="body2">- 加水後水位: {formatValue(observation.added_evaporation_level, 'mm')}</Typography>
                                        <Typography variant="body2">- 加水後水溫: {formatValue(observation.added_evaporation_temp, '°C')}</Typography>
                                      </>
                                    )}
                                    {observation.has_reduced_evaporation_water && (
                                      <>
                                        <Typography variant="body2">已減蒸發皿水</Typography>
                                        <Typography variant="body2">- 減水後水位: {formatValue(observation.reduced_evaporation_level, 'mm')}</Typography>
                                        <Typography variant="body2">- 減水後水溫: {formatValue(observation.reduced_evaporation_temp, '°C')}</Typography>
                                      </>
                                    )}
                                    {!observation.has_cleaned_evaporation_pan && 
                                     !observation.has_added_evaporation_water && 
                                     !observation.has_reduced_evaporation_water && (
                                      <Typography variant="body2" color="text.secondary">無條件式資料</Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Notes */}
                              {observation.notes && (
                                <Grid item xs={12}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="subtitle2" gutterBottom>備註</Typography>
                                      <Typography variant="body2">{observation.notes}</Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="每頁顯示筆數："
            labelDisplayedRows={({ from, to, count }) =>
              `第 ${from}-${to} 筆，共 ${count !== -1 ? count : `超過 ${to}`} 筆`
            }
          />
        </>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => navigate('/data-entry')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ObservationsList;