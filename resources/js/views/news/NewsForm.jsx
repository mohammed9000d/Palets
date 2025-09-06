import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// api
import { newsApi } from 'services/api';

// utils
import { getImageUrl } from 'utils/imageHelper';

// ==============================|| NEWS FORM ||============================== //

const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    main_title: '',
    sub_title: '',
    description: '',
    author_name: '',
    cover_photo: null,
    author_photo: null
  });

  const [previews, setPreviews] = useState({
    cover_photo: null,
    author_photo: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNews();
    }
  }, [id, isEdit]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getById(id);
      const newsData = response.data.data;
      
      setFormData({
        main_title: newsData.main_title || '',
        sub_title: newsData.sub_title || '',
        description: newsData.description || '',
        author_name: newsData.author_name || '',
        cover_photo: null,
        author_photo: null
      });

      setPreviews({
        cover_photo: newsData.cover_photo ? getImageUrl(newsData.cover_photo) : null,
        author_photo: newsData.author_photo ? getImageUrl(newsData.author_photo) : null
      });
    } catch (error) {
      setError('Error fetching news data');
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [fieldName]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEdit) {
        await newsApi.update(id, formData);
        setSuccess('News updated successfully!');
      } else {
        await newsApi.create(formData);
        setSuccess('News created successfully!');
      }

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/news');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to save news. Please try again.');
      }
      console.error('Error saving news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/news');
  };

  return (
    <MainCard title={isEdit ? 'Edit News' : 'Create News'}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Main Title"
            name="main_title"
            value={formData.main_title}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Sub Title"
            name="sub_title"
            value={formData.sub_title}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={6}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Author Name"
            name="author_name"
            value={formData.author_name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          {/* Cover Photo Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cover Photo
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                disabled={loading}
              >
                Choose Cover Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover_photo')}
                />
              </Button>
              {previews.cover_photo && (
                <Box
                  component="img"
                  src={previews.cover_photo}
                  alt="Cover preview"
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Author Photo Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Author Photo
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                disabled={loading}
              >
                Choose Author Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'author_photo')}
                />
              </Button>
              {previews.author_photo && (
                <Avatar
                  src={previews.author_photo}
                  sx={{ width: 80, height: 80 }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
};

export default NewsForm;
