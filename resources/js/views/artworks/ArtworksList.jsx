import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconEye,
  IconPhoto,
  IconStar,
  IconCurrencyDollar
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { artworksAPI, artistsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ArtworksList = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, artwork: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchArtists();
    fetchArtworks();
  }, [searchTerm, statusFilter, artistFilter, featuredFilter]);

  const fetchArtists = async () => {
    try {
      const response = await artistsAPI.getAll();
      setArtists(response.data.data || []);
    } catch (err) {
      console.error('Error fetching artists:', err);
    }
  };

  const fetchArtworks = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        artist_id: artistFilter !== 'all' ? artistFilter : undefined,
        featured: featuredFilter === 'featured' ? true : featuredFilter === 'not_featured' ? false : undefined
      };
      
      const response = await artworksAPI.getAll(params);
      setArtworks(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch artworks. Please check if the backend server is running.');
      console.error('Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artwork) => {
    try {
      await artworksAPI.delete(artwork.slug);
      fetchArtworks(pagination.current_page);
      setDeleteDialog({ open: false, artwork: null });
    } catch (err) {
      setError('Failed to delete artwork');
      console.error('Error deleting artwork:', err);
    }
  };

  const handleEdit = (artwork) => {
    navigate(`/admin/artworks/edit/${artwork.slug}`, { state: { artwork } });
  };

  const handleView = (artwork) => {
    navigate(`/admin/artworks/view/${artwork.slug}`, { state: { artwork } });
  };

  const handleToggleFeatured = async (artwork) => {
    try {
      await artworksAPI.toggleFeatured(artwork.slug);
      fetchArtworks(pagination.current_page);
    } catch (err) {
      setError('Failed to toggle featured status');
      console.error('Error toggling featured:', err);
    }
  };

  const openDeleteDialog = (artwork) => {
    setDeleteDialog({ open: true, artwork });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, artwork: null });
  };

  const handlePageChange = (newPage) => {
    fetchArtworks(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  if (loading && artworks.length === 0) {
    return (
      <MainCard title="Artworks Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title="Artworks Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/artworks/create')}
        >
          Add New Artwork
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            placeholder="Search artworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Artist</InputLabel>
            <Select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              label="Artist"
            >
              <MenuItem value="all">All Artists</MenuItem>
              {artists.map((artist) => (
                <MenuItem key={artist.id} value={artist.id}>
                  {artist.artist_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Featured</InputLabel>
            <Select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              label="Featured"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="not_featured">Not Featured</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cover</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Views</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box py={3}>
                    <IconPhoto size={48} stroke={1.5} style={{ color: '#ccc' }} />
                    <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                      No artworks found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'all' || artistFilter !== 'all' || featuredFilter !== 'all'
                        ? 'Try adjusting your filters' 
                        : 'Start by adding your first artwork'
                      }
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              artworks.map((artwork) => (
                <TableRow key={artwork.id} hover>
                  <TableCell>
                    <Avatar
                      src={artwork.cover_image_thumb_url}
                      alt={artwork.title}
                      sx={{ width: 50, height: 50 }}
                      variant="rounded"
                    >
                      <IconPhoto />
                    </Avatar>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {artwork.title}
                    </Typography>
                    {artwork.overview && (
                      <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 200 }}>
                        {artwork.overview.length > 50 
                          ? `${artwork.overview.substring(0, 50)}...` 
                          : artwork.overview
                        }
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {artwork.artist ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={artwork.artist.avatar_thumb_url}
                          sx={{ width: 24, height: 24 }}
                        >
                          {artwork.artist.artist_name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {artwork.artist.artist_name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Unknown Artist
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
                      color={getStatusColor(artwork.status)}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    {artwork.price ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <IconCurrencyDollar size={16} />
                        <Typography variant="body2">
                          {parseFloat(artwork.price).toLocaleString()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not priced
                      </Typography>
                    )}
                    {artwork.is_for_sale && (
                      <Chip label="For Sale" color="info" size="small" sx={{ mt: 0.5 }} />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFeatured(artwork)}
                      color={artwork.is_featured ? 'warning' : 'default'}
                      title={artwork.is_featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <IconStar fill={artwork.is_featured ? 'currentColor' : 'none'} />
                    </IconButton>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {artwork.view_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {artwork.like_count || 0} likes
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(artwork)}
                      title="View Artwork"
                    >
                      <IconEye />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(artwork)}
                      title="Edit Artwork"
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(artwork)}
                      title="Delete Artwork"
                      color="error"
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

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            disabled={pagination.current_page === 1}
            onClick={() => handlePageChange(pagination.current_page - 1)}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.current_page} of {pagination.last_page} 
            ({pagination.total} total artworks)
          </Typography>
          <Button
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => handlePageChange(pagination.current_page + 1)}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Artwork</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.artwork?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.artwork)}
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

export default ArtworksList;
