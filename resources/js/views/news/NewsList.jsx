import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Card,
  CardMedia,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// icons
import { IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react';

// api
import { newsApi } from 'services/api';

// utils
import { getImageUrl } from 'utils/imageHelper';

// ==============================|| NEWS LIST ||============================== //

const NewsList = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, newsItem: null });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAll();
      setNews(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch news. Please check if the backend server is running.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newsItem) => {
    try {
      await newsApi.delete(newsItem.id);
      setNews(news.filter(item => item.id !== newsItem.id));
      setDeleteDialog({ open: false, newsItem: null });
    } catch (err) {
      setError('Failed to delete news');
      console.error('Error deleting news:', err);
    }
  };

  const handleEdit = (newsItem) => {
    navigate(`/admin/news/${newsItem.id}/edit`);
  };

  const handleView = (newsItem) => {
    navigate(`/admin/news/${newsItem.id}`);
  };

  const openDeleteDialog = (newsItem) => {
    setDeleteDialog({ open: true, newsItem });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, newsItem: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <MainCard title="News Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="News Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/news/create')}
        >
          Add News
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cover</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No news articles found. Create your first news article!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    {item.cover_photo ? (
                      <CardMedia
                        component="img"
                        sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                        image={getImageUrl(item.cover_photo)}
                        alt={item.main_title}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          No Image
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.main_title}
                      </Typography>
                      {item.sub_title && (
                        <Typography variant="body2" color="textSecondary">
                          {item.sub_title}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.author_photo ? (
                        <Avatar
                          src={getImageUrl(item.author_photo)}
                          sx={{ width: 32, height: 32 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {item.author_name.charAt(0)}
                        </Avatar>
                      )}
                      <Typography variant="body2">
                        {item.author_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="info"
                      onClick={() => handleView(item)}
                      size="small"
                    >
                      <IconEye />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(item)}
                      size="small"
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(item)}
                      size="small"
                    >
                      <IconTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete news article "{deleteDialog.newsItem?.main_title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.newsItem)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default NewsList;
