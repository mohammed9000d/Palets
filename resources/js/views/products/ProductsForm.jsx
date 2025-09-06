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
  InputAdornment
} from '@mui/material';
import { 
  IconTrash, 
  IconShoppingCart,
  IconTag,
  IconCurrencyDollar,
  IconPhoto,
  IconDimensions
} from '@tabler/icons-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { productsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ProductsForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    artist_id: '',
    main_title: '',
    sub_title: '',
    description: '',
    price: '',
    discount_price: '',
    product_details: '',
    in_stock: true,
    is_custom_dimension: false,
    status: 'draft',
    dimensions: {
      width: '',
      height: '',
      depth: '',
      weight: ''
    }
  });

  const [files, setFiles] = useState({
    cover_photo: null,
    product_images: []
  });

  const [previews, setPreviews] = useState({
    cover_photo: null,
    product_images: []
  });

  const [existingImages, setExistingImages] = useState({
    cover_photo: null,
    product_images: []
  });

  const [artists, setArtists] = useState([]);

  // Load product data if editing and load artists
  useEffect(() => {
    if (isEdit && slug) {
      loadProduct();
    }
    loadArtists();
  }, [isEdit, slug]);

  const loadArtists = async () => {
    try {
      const response = await productsAPI.getArtists();
      setArtists(response.data.artists || []);
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getBySlug(slug);
      const product = response.data.product;
      
      setFormData({
        artist_id: product.artist_id || '',
        main_title: product.main_title || '',
        sub_title: product.sub_title || '',
        description: product.description || '',
        price: product.price || '',
        discount_price: product.discount_price || '',
        product_details: product.product_details || '',
        in_stock: product.in_stock,
        is_custom_dimension: product.is_custom_dimension,
        status: product.status || 'draft',
        dimensions: product.dimensions || {
          width: '',
          height: '',
          depth: '',
          weight: ''
        }
      });

      // Set existing images
      if (product.cover_photo_url) {
        setExistingImages(prev => ({ ...prev, cover_photo: product.cover_photo_url }));
      }
      if (product.product_images && product.product_images.length > 0) {
        setExistingImages(prev => ({ 
          ...prev, 
          product_images: product.product_images.map(img => ({
            id: img.id,
            url: img.url,
            thumb: img.thumb
          }))
        }));
      }
    } catch (err) {
      setError('Failed to load product data');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name.startsWith('dimensions_')) {
      const dimensionKey = name.replace('dimensions_', '');
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['in_stock', 'is_custom_dimension'].includes(name) ? checked : value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (type === 'cover_photo' && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, cover_photo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, cover_photo: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (type === 'product_images' && selectedFiles.length > 0) {
      setFiles(prev => ({ 
        ...prev, 
        product_images: [...prev.product_images, ...selectedFiles] 
      }));
      
      // Create previews
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({ 
            ...prev, 
            product_images: [...prev.product_images, e.target.result] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (type, index = null) => {
    if (type === 'cover_photo') {
      setFiles(prev => ({ ...prev, cover_photo: null }));
      setPreviews(prev => ({ ...prev, cover_photo: null }));
    } else if (type === 'product_images' && index !== null) {
      setFiles(prev => ({
        ...prev,
        product_images: prev.product_images.filter((_, i) => i !== index)
      }));
      setPreviews(prev => ({
        ...prev,
        product_images: prev.product_images.filter((_, i) => i !== index)
      }));
    }
  };

  const removeExistingImage = (type, imageId = null) => {
    if (type === 'cover_photo') {
      setExistingImages(prev => ({ ...prev, cover_photo: null }));
    } else if (type === 'product_images' && imageId) {
      setExistingImages(prev => ({
        ...prev,
        product_images: prev.product_images.filter(img => img.id !== imageId)
      }));
    }
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

      // Add removal flags for existing images if they were removed
      if (isEdit) {
        if (existingImages.cover_photo === null && !files.cover_photo) {
          submitData.remove_cover_photo = true;
        }
        
        const removedProductImages = [];
        // Logic to track removed product images would go here
        if (removedProductImages.length > 0) {
          submitData.remove_product_images = removedProductImages;
        }
      }

      let response;
      if (isEdit) {
        response = await productsAPI.update(slug, submitData);
      } else {
        response = await productsAPI.create(submitData);
      }

      setSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      
      // Navigate to products list after a short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      console.error('Error submitting product:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Failed to save product');
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
    <MainCard title={`${isEdit ? 'Edit' : 'Create'} Product`}>
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
              avatar={<IconShoppingCart />}
              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Artist (Optional)</InputLabel>
                  <Select
                    name="artist_id"
                    value={formData.artist_id}
                    onChange={handleChange}
                    label="Artist (Optional)"
                  >
                    <MenuItem value="">
                      <em>No Artist Selected</em>
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
                  label="Product Title"
                  value={formData.main_title}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconTag />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  name="sub_title"
                  label="Sub Title"
                  value={formData.sub_title}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Optional subtitle or tagline"
                />
                
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Detailed product description..."
                />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Product Details
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    Technical specifications, materials, features, etc. You can use formatting like **bold text** and bullet points.
                  </Typography>
                  <MDEditor
                    value={formData.product_details}
                    onChange={(value) => setFormData(prev => ({ ...prev, product_details: value || '' }))}
                    preview="edit"
                    hideToolbar={false}
                    height={200}
                    data-color-mode="light"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader 
              title="Pricing" 
              avatar={<IconCurrencyDollar />}
              sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label="Regular Price"
                    value={formData.price}
                    onChange={handleChange}
                    fullWidth
                    required
                    type="number"
                    step="0.01"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="discount_price"
                    label="Sale Price"
                    value={formData.discount_price}
                    onChange={handleChange}
                    fullWidth
                    type="number"
                    step="0.01"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    placeholder="Optional discount price"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dimensions Card */}
          <Card>
            <CardHeader 
              title="Dimensions" 
              avatar={<IconDimensions />}
              sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_custom_dimension"
                      checked={formData.is_custom_dimension}
                      onChange={handleChange}
                    />
                  }
                  label="Custom Dimensions Available"
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="dimensions_width"
                      label="Width"
                      value={formData.dimensions.width}
                      onChange={handleChange}
                      fullWidth
                      placeholder="cm"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="dimensions_height"
                      label="Height"
                      value={formData.dimensions.height}
                      onChange={handleChange}
                      fullWidth
                      placeholder="cm"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="dimensions_depth"
                      label="Depth"
                      value={formData.dimensions.depth}
                      onChange={handleChange}
                      fullWidth
                      placeholder="cm"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="dimensions_weight"
                      label="Weight"
                      value={formData.dimensions.weight}
                      onChange={handleChange}
                      fullWidth
                      placeholder="kg"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Status & Settings Card */}
          <Card>
            <CardHeader 
              title="Status & Settings" 
              sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" height="100%">
                    <FormControlLabel
                      control={
                        <Switch
                          name="in_stock"
                          checked={formData.in_stock}
                          onChange={handleChange}
                        />
                      }
                      label="In Stock"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Product Images Card */}
          <Card>
            <CardHeader 
              title="Product Images" 
              avatar={<IconPhoto />}
              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
            />
            <CardContent>
              <Grid container spacing={3}>
                {/* Cover Photo */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cover Photo
                  </Typography>
                  
                  {(previews.cover_photo || existingImages.cover_photo) && (
                    <Box position="relative" mb={2} display="flex" justifyContent="center">
                      <Avatar
                        src={previews.cover_photo || existingImages.cover_photo}
                        sx={{ width: 120, height: 120 }}
                        variant="rounded"
                      />
                      <IconButton
                        onClick={() => {
                          removeFile('cover_photo');
                          removeExistingImage('cover_photo');
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
                    {existingImages.cover_photo || previews.cover_photo ? 'Change Cover Photo' : 'Upload Cover Photo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover_photo')}
                    />
                  </Button>
                </Grid>

                {/* Product Images */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Product Images
                  </Typography>
                  
                  {/* Existing Images */}
                  {existingImages.product_images.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary">
                        Existing Images
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {existingImages.product_images.map((image) => (
                          <Grid item xs={6} sm={4} key={image.id}>
                            <Box position="relative">
                              <Avatar
                                src={image.thumb || image.url}
                                sx={{ width: 80, height: 80 }}
                                variant="rounded"
                              />
                              <IconButton
                                onClick={() => removeExistingImage('product_images', image.id)}
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
                  {previews.product_images.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary">
                        New Images
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {previews.product_images.map((preview, index) => (
                          <Grid item xs={6} sm={4} key={index}>
                            <Box position="relative">
                              <Avatar
                                src={preview}
                                sx={{ width: 80, height: 80 }}
                                variant="rounded"
                              />
                              <IconButton
                                onClick={() => removeFile('product_images', index)}
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
                    Add Product Images
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'product_images')}
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
            onClick={() => navigate('/admin/products')}
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
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </Button>
        </Box>
      </Box>
    </MainCard>
  );
};

export default ProductsForm;