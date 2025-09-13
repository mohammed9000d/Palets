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
  MenuItem
} from '@mui/material';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconEye,
  IconUsers
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { artistsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import TablePagination from '../../components/shared/TablePagination';
import TableSearch from '../../components/shared/TableSearch';

const ArtistsList = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, artist: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchArtists();
  }, [searchTerm, statusFilter]);

  const fetchArtists = async (page = 1) => {
    try {
      if (artists.length === 0) setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      
      const response = await artistsAPI.getAll(params);
      setArtists(response.data.data || response.data);
      setPagination({
        current_page: response.data.current_page || 1,
        per_page: response.data.per_page || 15,
        total: response.data.total || (response.data.length || 0),
        last_page: response.data.last_page || 1
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch artists. Please check if the backend server is running.');
      console.error('Error fetching artists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artist) => {
    try {
      await artistsAPI.delete(artist.slug);
      fetchArtists(pagination.current_page);
      setDeleteDialog({ open: false, artist: null });
    } catch (err) {
      setError('Failed to delete artist');
      console.error('Error deleting artist:', err);
    }
  };

  const handleEdit = (artist) => {
    navigate(`/admin/artists/edit/${artist.slug}`, { state: { artist } });
  };

  const handleView = (artist) => {
    navigate(`/admin/artists/view/${artist.slug}`, { state: { artist } });
  };

  const openDeleteDialog = (artist) => {
    setDeleteDialog({ open: true, artist });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, artist: null });
  };

  const handlePageChange = (newPage) => {
    fetchArtists(newPage);
  };

  if (loading) {
    return (
      <MainCard title="Artists Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title="Artists Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/artists/create')}
        >
          Add New Artist
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <TableSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search artists..."
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            options: [
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]
          }
        ]}
      />

      <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Artist Name</TableCell>
              <TableCell>Specialties</TableCell>
              <TableCell>Products Count</TableCell>
              <TableCell>Commission Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artists.map((artist) => (
                <TableRow key={artist.id} hover>
                  <TableCell>
                    <Avatar
                      src={artist.avatar_thumb_url}
                      alt={artist.artist_name}
                      sx={{ width: 40, height: 40 }}
                    >
                      {artist.artist_name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {artist.artist_name}
                    </Typography>
                    {artist.contact_email && (
                      <Typography variant="body2" color="textSecondary">
                        {artist.contact_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {artist.specialties || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        Total: {artist.products_count || 0}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        <Chip
                          label={`For Sale: ${artist.for_sale_products_count || 0}`}
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={`Not For Sale: ${artist.not_for_sale_products_count || 0}`}
                          size="small"
                          color="default"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {artist.commission_rate ? `${artist.commission_rate}%` : 'Not set'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={artist.is_active ? 'Active' : 'Inactive'}
                      color={artist.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(artist)}
                      title="View Artist"
                    >
                      <IconEye />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(artist)}
                      title="Edit Artist"
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(artist)}
                      title="Delete Artist"
                      color="error"
                    >
                      <IconTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            
            {artists.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <IconUsers size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No artists found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first artist'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={() => navigate('/admin/artists/create')}
                      sx={{ mt: 2 }}
                    >
                      Create Artist
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        pagination={pagination}
        onPageChange={handlePageChange}
        itemName="artists"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Artist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.artist?.artist_name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.artist)}
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

export default ArtistsList;
