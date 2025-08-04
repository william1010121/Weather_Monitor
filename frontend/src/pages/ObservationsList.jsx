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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
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
                  <TableRow key={observation.id} hover>
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