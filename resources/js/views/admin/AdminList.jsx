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
  CircularProgress
} from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const AdminList = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, admin: null });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAll();
      setAdmins(response.data);
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
      setAdmins(admins.filter(a => a.id !== admin.id));
      setDeleteDialog({ open: false, admin: null });
    } catch (err) {
      setError('Failed to delete admin');
      console.error('Error deleting admin:', err);
    }
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No admins found. Create your first admin!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role}
                      color={admin.role === 'super_admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
