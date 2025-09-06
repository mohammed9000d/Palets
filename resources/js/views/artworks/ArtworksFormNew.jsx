import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  MenuItem,
  Autocomplete,
  Chip
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { artworksAPI, artistsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ArtworksForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [artists, setArtists] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_id: '',
    year_created: '',
    medium: '',
    dimensions: '',
    price: '',
    is_for_sale: false,
    is_featured: false,
    tags: []
  });

  const [files, setFiles] = useState({
    cover_image: null,
    images: []
  });

  const [previews, setPreviews] = useState({
    cover_image: null,
    images: []
  });

  const [existingImages, setExistingImages] = useState({
    cover: null,
    gallery: []
  });

  // Load data on mount
  useEffect(() => {
    loadArtists();
    loadTags();
    if (isEdit && slug) {
      loadArtwork();
    }
  }, [isEdit, slug]);

  const loadArtists = async () => {
    try {
      const response = await artistsAPI.getAll();
      setArtists(response.data.artists || []);
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  };

  const loadTags = async () => {
    try {
      const response = await artworksAPI.getTags();
      setAvailableTags(response.data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadArtwork = async () => {
    setLoading(true);
    try {
      const response = await artworksAPI.getBySlug(slug);
      const artwork = response.data.artwork;
      
      setFormData({
        title: artwork.title || '',
        description: artwork.description || '',
        artist_id: artwork.artist_id || '',
        year_created: artwork.year_created || '',
        medium: artwork.medium || '',
        dimensions: artwork.dimensions || '',
        price: artwork.price || '',
        is_for_sale: artwork.is_for_sale || false,
        is_featured: artwork.is_featured || false,
        tags: artwork.tags || []
      });

      // Set existing images
      if (artwork.cover_image_url) {
        setExistingImages(prev => ({ ...prev, cover: artwork.cover_image_url }));
      }
      if (artwork.images && artwork.images.length > 0) {
        setExistingImages(prev => ({ 
          ...prev, 
          gallery: artwork.images.map(img => ({
            id: img.id,
            url: img.url,
            thumb: img.thumb
          }))
        }));
      }
    } catch (err) {
      setError('Failed to load artwork data');
      console.error('Error loading artwork:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'is_for_sale' || name === 'is_featured') ? checked : value
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, tags: newValue }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (type === 'cover' && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, cover_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, cover_image: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'gallery' && selectedFiles.length > 0) {
      setFiles(prev => ({ 
        ...prev, 
        images: [...prev.images, ...selectedFiles] 
      }));
      
      // Create previews
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({ 
            ...prev, 
            images: [...prev.images, e.target.result] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCoverImage = () => {
    setFiles(prev => ({ ...prev, cover_image: null }));
    setPreviews(prev => ({ ...prev, cover_image: null }));
    setExistingImages(prev => ({ ...prev, cover: null }));
  };

  const removeGalleryImage = (index) => {
    setFiles(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviews(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingGalleryImage = (index) => {
    setExistingImages(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        ...files
      };

      // Handle removed existing images
      if (isEdit) {
        if (!existingImages.cover) {
          submitData.remove_cover_image = true;
        }
      }

      if (isEdit) {
        await artworksAPI.update(slug, submitData);
        setSuccess('Artwork updated successfully!');
      } else {
        await artworksAPI.create(submitData);
        setSuccess('Artwork created successfully!');
      }
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/artworks');
      }, 2000);

    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to save artwork. Please try again.');
      }
      console.error('Error saving artwork:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/artworks');
  };

  return (
    <MainCard title={isEdit ? 'Edit Artwork' : 'Create Artwork'}>
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
            label="Artwork Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            disabled={loading}
          />

          <TextField
            fullWidth
            select
            label="Artist"
            name="artist_id"
            value={formData.artist_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <MenuItem value="">Select an artist</MenuItem>
            {artists.map((artist) => (
              <MenuItem key={artist.id} value={artist.id}>
                {artist.artist_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Year Created"
            name="year_created"
            type="number"
            value={formData.year_created}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Medium"
            name="medium"
            value={formData.medium}
            onChange={handleChange}
            placeholder="e.g., Oil on canvas, Watercolor, Digital"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            placeholder="e.g., 24 x 36 inches"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            disabled={loading}
          />

          <Autocomplete
            multiple
            options={availableTags}
            value={formData.tags}
            onChange={handleTagsChange}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags..."
                disabled={loading}
              />
            )}
          />

          {/* Cover Image Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cover Image
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                disabled={loading}
              >
                Choose Cover Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                />
              </Button>
              {(previews.cover_image || existingImages.cover) && (
                <Box
                  component="img"
                  src={previews.cover_image || existingImages.cover}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
              {(previews.cover_image || existingImages.cover) && (
                <IconButton
                  color="error"
                  onClick={removeCoverImage}
                  disabled={loading}
                >
                  <IconTrash />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Gallery Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Gallery Images
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Add Gallery Images
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'gallery')}
              />
            </Button>
            
            {/* Gallery Preview */}
            <Box display="flex" flexWrap="wrap" gap={1}>
              {previews.images.map((preview, index) => (
                <Box key={`new-${index}`} position="relative">
                  <Box
                    component="img"
                    src={preview}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeGalleryImage(index)}
                    sx={{ position: 'absolute', top: -8, right: -8 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Box>
              ))}
              
              {existingImages.gallery.map((image, index) => (
                <Box key={`existing-${image.id}`} position="relative">
                  <Box
                    component="img"
                    src={image.thumb || image.url}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeExistingGalleryImage(index)}
                    sx={{ position: 'absolute', top: -8, right: -8 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                name="is_for_sale"
                checked={formData.is_for_sale}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="For Sale"
          />

          <FormControlLabel
            control={
              <Switch
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Featured"
          />

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

export default ArtworksForm;
