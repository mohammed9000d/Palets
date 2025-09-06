import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// api
import { newsApi } from 'services/api';

// utils
import { getImageUrl } from 'utils/imageHelper';

// ==============================|| NEWS VIEW ||============================== //

const NewsView = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getById(id);
      setNews(response.data.data);
    } catch (error) {
      setError('Error fetching news data');
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await newsApi.delete(id);
        navigate('/admin/news');
      } catch (error) {
        setError('Error deleting news');
        console.error('Error deleting news:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainCard title="News Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error || !news) {
    return (
      <MainCard title="News Details">
        <Alert severity="error">{error || 'News not found'}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="News Details" content={false}>
      <CardContent>
        <Grid container spacing={gridSpacing}>
          {/* Header with actions */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/admin/news')}
                variant="outlined"
              >
                Back to News
              </Button>
              <Box display="flex" gap={1}>
                <IconButton
                  component={Link}
                  to={`/admin/news/${news.id}/edit`}
                  color="primary"
                  size="large"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={handleDelete}
                  color="error"
                  size="large"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Cover Photo */}
          {news.cover_photo && (
            <Grid item xs={12}>
              <Card>
                <CardMedia
                  component="img"
                  height="400"
                  image={getImageUrl(news.cover_photo)}
                  alt={news.main_title}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h2" gutterBottom>
                {news.main_title}
              </Typography>
              
              {news.sub_title && (
                <Typography 
                  variant="h4" 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontWeight: 400 }}
                >
                  {news.sub_title}
                </Typography>
              )}

              {/* Author and Date Info */}
              <Box display="flex" alignItems="center" gap={2} my={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  {news.author_photo ? (
                    <Avatar
                      src={getImageUrl(news.author_photo)}
                      sx={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {news.author_name.charAt(0)}
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {news.author_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Author
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mx: 2, height: 40, width: 1, backgroundColor: theme.palette.divider }} />
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Published
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(news.created_at)}
                  </Typography>
                </Box>

                {news.updated_at !== news.created_at && (
                  <>
                    <Box sx={{ mx: 2, height: 40, width: 1, backgroundColor: theme.palette.divider }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(news.updated_at)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>

              {/* Description */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {news.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
};

export default NewsView;
