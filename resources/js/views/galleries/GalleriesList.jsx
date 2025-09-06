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
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconEye,
  IconPalette,
  IconCalendar,
  IconMapPin,
  IconUsers
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { galleriesAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-markdown-preview/markdown.css';

const GalleriesList = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, gallery: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchGalleries();
  }, [searchTerm, statusFilter, periodFilter]);

  const fetchGalleries = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        period: periodFilter === 'all' ? undefined : periodFilter
      };
      
      const response = await galleriesAPI.getAll(params);
      setGalleries(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch galleries. Please check if the backend server is running.');
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gallery) => {
    try {
      await galleriesAPI.delete(gallery.slug);
      fetchGalleries(pagination.current_page);
      setDeleteDialog({ open: false, gallery: null });
    } catch (err) {
      setError('Failed to delete gallery');
      console.error('Error deleting gallery:', err);
    }
  };

  const handleEdit = (gallery) => {
    navigate(`/admin/galleries/edit/${gallery.slug}`);
  };

  const handleView = (gallery) => {
    navigate(`/admin/galleries/view/${gallery.slug}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getPeriodColor = (gallery) => {
    if (gallery.is_active) return 'success';
    if (gallery.is_upcoming) return 'info';
    if (gallery.is_past) return 'default';
    return 'default';
  };

  const getPeriodLabel = (gallery) => {
    if (gallery.is_active) return 'Active';
    if (gallery.is_upcoming) return 'Upcoming';
    if (gallery.is_past) return 'Past';
    return 'Unknown';
  };

  if (loading && galleries.length === 0) {
    return (
      <MainCard title="Art Panel Galleries">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title="Art Panel Galleries" 
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/galleries/create')}
        >
          Create Gallery
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search galleries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
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
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                label="Period"
              >
                <MenuItem value="all">All Periods</MenuItem>
                <MenuItem value="active">Active Now</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="past">Past</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Galleries Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gallery</TableCell>
              <TableCell>Organizer</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Artists</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {galleries.map((gallery) => (
              <TableRow key={gallery.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={gallery.cover_image_thumb_url}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    >
                      <IconPalette />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {gallery.main_title}
                      </Typography>
                      {gallery.sub_title && (
                        <Typography variant="caption" color="textSecondary">
                          {gallery.sub_title}
                        </Typography>
                      )}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        Duration: {gallery.duration} days
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  {gallery.organizer_artist ? (
                    <Chip 
                      label={gallery.organizer_artist.artist_name} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No Organizer
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip 
                      label={getPeriodLabel(gallery)}
                      color={getPeriodColor(gallery)}
                      size="small"
                      icon={<IconCalendar />}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {gallery.date_period}
                    </Typography>
                  </Stack>
                </TableCell>
                
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconUsers size={16} />
                    <Typography variant="body2">
                      {gallery.participating_artists_count}
                    </Typography>
                    {gallery.participating_artists_count > 0 && (
                      <Tooltip 
                        title={
                          <Box>
                            {gallery.participating_artists.slice(0, 3).map(artist => (
                              <Typography key={artist.id} variant="caption" display="block">
                                {artist.artist_name} {artist.role && `(${artist.role})`}
                              </Typography>
                            ))}
                            {gallery.participating_artists_count > 3 && (
                              <Typography variant="caption" display="block">
                                +{gallery.participating_artists_count - 3} more...
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <IconButton size="small">
                          <IconEye size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
                    color={getStatusColor(gallery.status)}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  {gallery.location ? (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconMapPin size={16} />
                      <Typography variant="body2">
                        {gallery.location}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No location
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit Gallery">
                      <IconButton 
                        onClick={() => handleEdit(gallery)}
                        color="primary"
                        size="small"
                      >
                        <IconEdit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Gallery">
                      <IconButton 
                        onClick={() => setDeleteDialog({ open: true, gallery })}
                        color="error"
                        size="small"
                      >
                        <IconTrash />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {galleries.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <IconPalette size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No galleries found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'all' || periodFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first gallery'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={() => navigate('/admin/galleries/create')}
                      sx={{ mt: 2 }}
                    >
                      Create Gallery
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            onClick={() => fetchGalleries(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          
          <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.current_page} of {pagination.last_page} 
            ({pagination.total} total galleries)
          </Typography>
          
          <Button
            onClick={() => fetchGalleries(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, gallery: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete the gallery "{deleteDialog.gallery?.main_title}"? 
            This action cannot be undone and will remove all associated artist relationships.
          </Typography>
          
          {deleteDialog.gallery && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gallery Details:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Period:</strong> {deleteDialog.gallery.date_period}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Location:</strong> {deleteDialog.gallery.location || 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Artists:</strong> {deleteDialog.gallery.participating_artists_count} participating
                  </Typography>
                </Grid>
                
                {deleteDialog.gallery.description && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Description Preview:
                    </Typography>
                    <Box 
                      sx={{ 
                        maxHeight: 150, 
                        overflow: 'auto', 
                        border: 1, 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        p: 1,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <MDEditor.Markdown 
                        source={deleteDialog.gallery.description} 
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, gallery: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteDialog.gallery)}
            color="error"
            variant="contained"
          >
            Delete Gallery
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default GalleriesList;
