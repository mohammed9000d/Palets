import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Grid,
  Stack,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { 
  IconTrash, 
  IconPalette,
  IconCalendar,
  IconPhoto,
  IconUsers,
  IconMapPin
} from '@tabler/icons-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { galleriesAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const GalleriesForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    organizer_artist_id: '',
    main_title: '',
    sub_title: '',
    overview: '',
    description: '',
    start_date: null,
    end_date: null,
    status: 'draft',
    location: ''
  });

  const [files, setFiles] = useState({
    cover_image: null,
    gallery_images: []
  });

  const [previews, setPreviews] = useState({
    cover_image: null,
    gallery_images: []
  });

  const [existingImages, setExistingImages] = useState({
    cover_image: null,
    gallery_images: []
  });

  const [artists, setArtists] = useState([]);
  const [participatingArtists, setParticipatingArtists] = useState([]);

  // Load gallery data if editing and load artists
  useEffect(() => {
    if (isEdit && slug) {
      loadGallery();
    }
    loadArtists();
  }, [isEdit, slug]);

  const loadArtists = async () => {
    try {
      const response = await galleriesAPI.getArtists();
      setArtists(response.data.artists || []);
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const response = await galleriesAPI.getBySlug(slug);
      const gallery = response.data.gallery;
      
      setFormData({
        organizer_artist_id: gallery.organizer_artist_id || '',
        main_title: gallery.main_title || '',
        sub_title: gallery.sub_title || '',
        overview: gallery.overview || '',
        description: gallery.description || '',
        start_date: gallery.start_date ? dayjs(gallery.start_date) : null,
        end_date: gallery.end_date ? dayjs(gallery.end_date) : null,
        status: gallery.status || 'draft',
        location: gallery.location || ''
      });

      // Set participating artists
      if (gallery.participating_artists) {
        setParticipatingArtists(gallery.participating_artists);
      }

      // Set existing images
      if (gallery.cover_image_url) {
        setExistingImages(prev => ({ ...prev, cover_image: gallery.cover_image_url }));
      }
      if (gallery.gallery_images && gallery.gallery_images.length > 0) {
        setExistingImages(prev => ({ 
          ...prev, 
          gallery_images: gallery.gallery_images.map(img => ({
            id: img.id,
            url: img.url,
            thumb: img.thumb
          }))
        }));
      }
    } catch (err) {
      setError('Failed to load gallery data');
      console.error('Error loading gallery:', err);
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

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (type === 'cover_image' && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, cover_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, cover_image: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'gallery_images' && selectedFiles.length > 0) {
      setFiles(prev => ({ 
        ...prev, 
        gallery_images: [...prev.gallery_images, ...selectedFiles] 
      }));
      
      // Create previews
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({ 
            ...prev, 
            gallery_images: [...prev.gallery_images, e.target.result] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (type, index = null) => {
    if (type === 'cover_image') {
      setFiles(prev => ({ ...prev, cover_image: null }));
      setPreviews(prev => ({ ...prev, cover_image: null }));
    } else if (type === 'gallery_images' && index !== null) {
      setFiles(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== index)
      }));
      setPreviews(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== index)
      }));
    }
  };

  const removeExistingImage = (type, imageId = null) => {
    if (type === 'cover_image') {
      setExistingImages(prev => ({ ...prev, cover_image: null }));
    } else if (type === 'gallery_images' && imageId) {
      setExistingImages(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter(img => img.id !== imageId)
      }));
    }
  };

  const addParticipatingArtist = (artistId, role = '') => {
    const artist = artists.find(a => a.id === parseInt(artistId));
    if (artist && !participatingArtists.find(pa => pa.artist_id === artist.id)) {
      setParticipatingArtists(prev => [...prev, {
        artist_id: artist.id,
        artist_name: artist.artist_name,
        role: role,
        display_order: prev.length
      }]);
    }
  };

  const removeParticipatingArtist = (artistId) => {
    setParticipatingArtists(prev => prev.filter(pa => pa.artist_id !== artistId));
  };

  const updateArtistRole = (artistId, role) => {
    setParticipatingArtists(prev => prev.map(pa => 
      pa.artist_id === artistId ? { ...pa, role } : pa
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? formData.start_date.format('YYYY-MM-DD') : '',
        end_date: formData.end_date ? formData.end_date.format('YYYY-MM-DD') : '',
        participating_artists: participatingArtists.map(pa => ({
          artist_id: pa.artist_id,
          role: pa.role,
          display_order: pa.display_order
        })),
        ...files
      };

      // Add removal flags for existing images if they were removed
      if (isEdit) {
        if (existingImages.cover_image === null && !files.cover_image) {
          submitData.remove_cover_image = true;
        }
      }

      let response;
      if (isEdit) {
        response = await galleriesAPI.update(slug, submitData);
      } else {
        response = await galleriesAPI.create(submitData);
      }

      setSuccess(`Gallery ${isEdit ? 'updated' : 'created'} successfully!`);
      
      // Navigate to galleries list after a short delay
      setTimeout(() => {
        navigate('/admin/galleries');
      }, 1500);
    } catch (err) {
      console.error('Error submitting gallery:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Failed to save gallery');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MainCard title={`${isEdit ? 'Edit' : 'Create'} Gallery`}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Basic Information Card */}
            <Card>
              <CardHeader 
                title="Basic Information" 
                avatar={<IconPalette />}
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Organizer Artist (Optional)</InputLabel>
                    <Select
                      name="organizer_artist_id"
                      value={formData.organizer_artist_id}
                      onChange={handleChange}
                      label="Organizer Artist (Optional)"
                    >
                      <MenuItem value="">
                        <em>No Organizer Selected</em>
                      </MenuItem>
                      {artists.map((artist) => (
                        <MenuItem key={artist.id} value={artist.id}>
                          {artist.artist_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    name="main_title"
                    label="Gallery Title"
                    value={formData.main_title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  
                  <TextField
                    name="sub_title"
                    label="Sub Title"
                    value={formData.sub_title}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Optional subtitle or theme"
                  />
                  
                  <TextField
                    name="overview"
                    label="Overview"
                    value={formData.overview}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Short summary of the gallery..."
                  />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                      Detailed gallery description. You can use formatting like **bold text** and bullet points.
                    </Typography>
                    <MDEditor
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value || '' }))}
                      preview="edit"
                      hideToolbar={false}
                      height={200}
                      data-color-mode="light"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                    />
                  </Box>

                  <TextField
                    name="location"
                    label="Location"
                    value={formData.location}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Physical location of the gallery"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Date Period Card */}
            <Card>
              <CardHeader 
                title="Gallery Period" 
                avatar={<IconCalendar />}
                sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={formData.start_date}
                      onChange={(value) => handleDateChange('start_date', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={formData.end_date}
                      onChange={(value) => handleDateChange('end_date', value)}
                      minDate={formData.start_date}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                {formData.start_date && formData.end_date && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {formData.end_date.diff(formData.start_date, 'day') + 1} days
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Participating Artists Card */}
            <Card>
              <CardHeader 
                title="Participating Artists" 
                avatar={<IconUsers />}
                sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Artists
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Autocomplete
                          options={artists.filter(artist => 
                            !participatingArtists.find(pa => pa.artist_id === artist.id)
                          )}
                          getOptionLabel={(option) => option.artist_name}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Artist" size="small" />
                          )}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              addParticipatingArtist(newValue.id);
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Current Participating Artists */}
                  {participatingArtists.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Current Artists ({participatingArtists.length})
                      </Typography>
                      <Stack spacing={1}>
                        {participatingArtists.map((artist, index) => (
                          <Card key={artist.artist_id} variant="outlined">
                            <CardContent sx={{ py: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {artist.artist_name}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Role"
                                    value={artist.role || ''}
                                    onChange={(e) => updateArtistRole(artist.artist_id, e.target.value)}
                                    size="small"
                                    fullWidth
                                    placeholder="e.g., Featured, Guest"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <IconButton
                                    onClick={() => removeParticipatingArtist(artist.artist_id)}
                                    color="error"
                                    size="small"
                                  >
                                    <IconTrash />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader 
                title="Status" 
                sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}
              />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Publication Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Publication Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Gallery Images Card */}
            <Card>
              <CardHeader 
                title="Gallery Images" 
                avatar={<IconPhoto />}
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Cover Image */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cover Image
                    </Typography>
                    
                    {(previews.cover_image || existingImages.cover_image) && (
                      <Box position="relative" mb={2} display="flex" justifyContent="center">
                        <Avatar
                          src={previews.cover_image || existingImages.cover_image}
                          sx={{ width: 120, height: 120 }}
                          variant="rounded"
                        />
                        <IconButton
                          onClick={() => {
                            removeFile('cover_image');
                            removeExistingImage('cover_image');
                          }}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: '50%',
                            transform: 'translateX(50%)',
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                          size="small"
                        >
                          <IconTrash size={16} />
                        </IconButton>
                      </Box>
                    )}
                    
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<IconPhoto />}
                    >
                      {existingImages.cover_image || previews.cover_image ? 'Change Cover Image' : 'Upload Cover Image'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'cover_image')}
                      />
                    </Button>
                  </Grid>

                  {/* Gallery Images */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Gallery Images
                    </Typography>
                    
                    {/* Existing Images */}
                    {existingImages.gallery_images.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="caption" color="textSecondary">
                          Existing Images
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {existingImages.gallery_images.map((image) => (
                            <Grid item xs={6} sm={4} key={image.id}>
                              <Box position="relative">
                                <Avatar
                                  src={image.thumb || image.url}
                                  sx={{ width: 80, height: 80 }}
                                  variant="rounded"
                                />
                                <IconButton
                                  onClick={() => removeExistingImage('gallery_images', image.id)}
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' }
                                  }}
                                  size="small"
                                >
                                  <IconTrash size={12} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    {/* New Image Previews */}
                    {previews.gallery_images.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="caption" color="textSecondary">
                          New Images
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {previews.gallery_images.map((preview, index) => (
                            <Grid item xs={6} sm={4} key={index}>
                              <Box position="relative">
                                <Avatar
                                  src={preview}
                                  sx={{ width: 80, height: 80 }}
                                  variant="rounded"
                                />
                                <IconButton
                                  onClick={() => removeFile('gallery_images', index)}
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' }
                                  }}
                                  size="small"
                                >
                                  <IconTrash size={12} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<IconPhoto />}
                    >
                      Add Gallery Images
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'gallery_images')}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>

          {/* Action Buttons */}
          <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/galleries')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Gallery' : 'Create Gallery')}
            </Button>
          </Box>
        </Box>
      </MainCard>
    </LocalizationProvider>
  );
};

export default GalleriesForm;
