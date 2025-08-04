import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  TextField,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { observationsAPI } from '../services/api';

// Helper functions
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0];
};

const getEndOfDay = (date) => {
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

const Download = () => {
  const [startDate, setStartDate] = useState(() => formatDateForInput(getStartOfMonth()));
  const [endDate, setEndDate] = useState(() => formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (startDate) {
        params.start_date = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.end_date = getEndOfDay(new Date(endDate)).toISOString();
      }

      const response = await observationsAPI.exportCSV(params);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data            <li>所有用戶都可以下載完整的觀測資料</li>, { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'weather_observations.csv';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download failed:', err);
      let errorMessage = '下載失敗，請稍後重試';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = '登入已過期，請重新登入';
        } else if (err.response.status === 403) {
          errorMessage = '沒有權限執行此操作';
        } else if (err.response.status === 404) {
          errorMessage = '找不到資料';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = `錯誤：${err.response.data.detail}`;
        }
      } else if (err.request) {
        errorMessage = '無法連線到服務器，請檢查網路連線';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToCurrentMonth = () => {
    setStartDate(formatDateForInput(getStartOfMonth()));
    setEndDate(formatDateForInput(new Date()));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          資料下載
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          選擇日期範圍下載氣象觀測資料為 CSV 格式檔案
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="開始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: formatDateForInput(new Date()),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="結束日期"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: startDate,
                max: formatDateForInput(new Date()),
              }}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={loading || !startDate || !endDate}
          >
            {loading ? '下載中...' : '下載 CSV 檔案'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleResetToCurrentMonth}
            disabled={loading}
          >
            重設為本月
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>注意事項：</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>CSV 檔案使用 UTF-8 編碼，可在 Excel 中正確顯示中文</li>
            <li>檔案包含所選日期範圍內的所有觀測資料</li>
            <li>所有用戶都可以下載完整的觀測資料</li>
            <li>若無選擇日期，將下載所有可用資料</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Download;