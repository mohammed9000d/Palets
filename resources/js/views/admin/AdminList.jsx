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
  Grid
} from '@mui/material';
import { IconEdit, IconTrash, IconPlus, IconSearch, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import TablePagination from '../../components/shared/TablePagination';
import TableSearch from '../../components/shared/TableSearch';
import TableLoading from '../../components/shared/TableLoading';

const AdminList = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, admin: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchAdmins();
  }, [searchTerm]);

  const fetchAdmins = async (page = 1) => {
    try {
      if (admins.length === 0) setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      const response = await adminAPI.getAll(params);
      setAdmins(response.data.data || response.data);
      setPagination({
        current_page: response.data.current_page || 1,
        per_page: response.data.per_page || 15,
        total: response.data.total || (response.data.length || 0),
        last_page: response.data.last_page || 1
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch admins. Please check if the backend server is running.');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    try {
      await adminAPI.delete(admin.id);
      fetchAdmins(pagination.current_page);
      setDeleteDialog({ open: false, admin: null });
    } catch (err) {
      setError('Failed to delete admin');
      console.error('Error deleting admin:', err);
    }
  };

  const handlePageChange = (newPage) => {
    fetchAdmins(newPage);
  };

  const handleEdit = (admin) => {
    navigate(`/admin/edit/${admin.id}`, { state: { admin } });
  };

  const openDeleteDialog = (admin) => {
    setDeleteDialog({ open: true, admin });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, admin: null });
  };

  if (loading) {
    return (
      <MainCard title="Admin Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Admin Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/create')}
        >
          Add Admin
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Filter */}
      <TableSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name or email..."
      />
      
      <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.is_active ? 'Active' : 'Inactive'}
                      color={admin.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(admin)}
                      size="small"
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(admin)}
                      size="small"
                    >
                      <IconTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            
            {admins.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box py={4}>
                    <IconUsers size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No admins found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first admin'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={() => navigate('/admin/create')}
                      sx={{ mt: 2 }}
                    >
                      Create Admin
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
        itemName="admins"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete admin "{deleteDialog.admin?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.admin)}
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

export default AdminList;
