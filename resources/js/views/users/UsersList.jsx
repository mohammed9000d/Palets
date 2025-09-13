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
import { usersAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import TablePagination from '../../components/shared/TablePagination';
import TableSearch from '../../components/shared/TableSearch';
import TableLoading from '../../components/shared/TableLoading';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async (page = 1) => {
    try {
      if (users.length === 0) setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      const response = await usersAPI.getAll(params);
      setUsers(response.data.data || response.data);
      setPagination({
        current_page: response.data.current_page || 1,
        per_page: response.data.per_page || 15,
        total: response.data.total || (response.data.length || 0),
        last_page: response.data.last_page || 1
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch users. Please check if the backend server is running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      await usersAPI.delete(user.id);
      fetchUsers(pagination.current_page);
      setDeleteDialog({ open: false, user: null });
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/edit/${user.id}`, { state: { user } });
  };

  const openDeleteDialog = (user) => {
    setDeleteDialog({ open: true, user });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, user: null });
  };

  if (loading) {
    return (
      <MainCard title="User Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="User Management"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/users/create')}
        >
          Add User
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
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
{/* <TableCell>Newsletter</TableCell> */}
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
{/* Newsletter column hidden for future use
                  <TableCell>
                    <Chip
                      label={user.newsletter_subscription ? 'Subscribed' : 'Not Subscribed'}
                      color={user.newsletter_subscription ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  */}
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(user)}
                      size="small"
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(user)}
                      size="small"
                    >
                      <IconTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <IconUsers size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No users found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first user'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={() => navigate('/admin/users/create')}
                      sx={{ mt: 2 }}
                    >
                      Create User
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
        itemName="users"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.user)}
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

export default UsersList;


