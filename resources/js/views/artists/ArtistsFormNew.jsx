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
  Avatar,
  IconButton
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { artistsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ArtistsForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    artist_name: '',
    bio: '',
    link: '',
    is_active: true,
    social_links: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      youtube: '',
      website: ''
    },
    contact_email: '',
    phone: '',
    specialties: '',
    commission_rate: ''
  });

  const [files, setFiles] = useState({
    avatar: null,
    gallery_images: []
  });

  const [previews, setPreviews] = useState({
    avatar: null,
    gallery_images: []
  });

  const [existingImages, setExistingImages] = useState({
    avatar: null,
    gallery: []
  });

  // Load artist data if editing
  useEffect(() => {
    if (isEdit && slug) {
      loadArtist();
    }
  }, [isEdit, slug]);

  const loadArtist = async () => {
    setLoading(true);
    try {
      const response = await artistsAPI.getBySlug(slug);
      const artist = response.data.artist;
      
      setFormData({
        artist_name: artist.artist_name || '',
        bio: artist.bio || '',
        link: artist.link || '',
        is_active: artist.is_active,
        social_links: {
          instagram: artist.social_links?.instagram || '',
          twitter: artist.social_links?.twitter || '',
          facebook: artist.social_links?.facebook || '',
          linkedin: artist.social_links?.linkedin || '',
          youtube: artist.social_links?.youtube || '',
          website: artist.social_links?.website || ''
        },
        contact_email: artist.contact_email || '',
        phone: artist.phone || '',
        specialties: artist.specialties || '',
        commission_rate: artist.commission_rate || ''
      });

      // Set existing images
      if (artist.avatar_url) {
        setExistingImages(prev => ({ ...prev, avatar: artist.avatar_url }));
      }
      if (artist.gallery_images && artist.gallery_images.length > 0) {
        setExistingImages(prev => ({ 
          ...prev, 
          gallery: artist.gallery_images.map(img => ({
            id: img.id,
            url: img.url,
            thumb: img.thumb
          }))
        }));
      }
    } catch (err) {
      setError('Failed to load artist data');
      console.error('Error loading artist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'is_active' ? checked : value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (type === 'avatar' && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'gallery' && selectedFiles.length > 0) {
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

  const removeAvatar = () => {
    setFiles(prev => ({ ...prev, avatar: null }));
    setPreviews(prev => ({ ...prev, avatar: null }));
    setExistingImages(prev => ({ ...prev, avatar: null }));
  };

  const removeGalleryImage = (index) => {
    setFiles(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
    setPreviews(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
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
      // Clean up social_links - remove empty values and ensure it's a proper object
      const cleanSocialLinks = {};
      Object.keys(formData.social_links).forEach(key => {
        if (formData.social_links[key] && formData.social_links[key].trim() !== '') {
          cleanSocialLinks[key] = formData.social_links[key].trim();
        }
      });

      const submitData = {
        ...formData,
        social_links: cleanSocialLinks,
        ...files
      };

      // Handle removed existing images
      if (isEdit) {
        if (!existingImages.avatar) {
          submitData.remove_avatar = true;
        }
      }

      if (isEdit) {
        await artistsAPI.update(slug, submitData);
        setSuccess('Artist updated successfully!');
      } else {
        await artistsAPI.create(submitData);
        setSuccess('Artist created successfully!');
      }
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/artists');
      }, 2000);

    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to save artist. Please try again.');
      }
      console.error('Error saving artist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/artists');
  };

  return (
    <MainCard title={isEdit ? 'Edit Artist' : 'Create Artist'}>
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
            label="Artist Name"
            name="artist_name"
            value={formData.artist_name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Biography"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            multiline
            rows={4}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Portfolio/Website URL"
            name="link"
            value={formData.link}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Contact Email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Specialties"
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            placeholder="e.g., Oil painting, Watercolor, Digital art"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Commission Rate (%)"
            name="commission_rate"
            type="number"
            value={formData.commission_rate}
            onChange={handleChange}
            disabled={loading}
          />

          {/* Social Media Links */}
          <Typography variant="h6" sx={{ mt: 2 }}>Social Media Links</Typography>
          
          <TextField
            fullWidth
            label="Instagram URL"
            name="social_instagram"
            value={formData.social_links.instagram}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Twitter URL"
            name="social_twitter"
            value={formData.social_links.twitter}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Facebook URL"
            name="social_facebook"
            value={formData.social_links.facebook}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Website URL"
            name="social_website"
            value={formData.social_links.website}
            onChange={handleChange}
            disabled={loading}
          />

          {/* Avatar Upload */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Profile Photo
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                disabled={loading}
              >
                Choose Profile Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
              </Button>
              {(previews.avatar || existingImages.avatar) && (
                <Avatar
                  src={previews.avatar || existingImages.avatar}
                  sx={{ width: 80, height: 80 }}
                />
              )}
              {(previews.avatar || existingImages.avatar) && (
                <IconButton
                  color="error"
                  onClick={removeAvatar}
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
              {previews.gallery_images.map((preview, index) => (
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
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Active"
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

export default ArtistsForm;
