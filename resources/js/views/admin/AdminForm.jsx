import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const AdminForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'super_admin',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      // If admin data was passed through navigation state, use it
      if (location.state?.admin) {
        const admin = location.state.admin;
        setFormData({
          name: admin.name,
          email: admin.email,
          password: '', // Don't populate password for security
          role: 'super_admin', // Always set to super_admin for now
          is_active: admin.is_active
        });
      } else {
        // Otherwise fetch from API
        fetchAdmin();
      }
    }
  }, [id, isEdit, location.state]);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getById(id);
      const admin = response.data;
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: 'super_admin', // Always set to super_admin for now
        is_active: admin.is_active
      });
    } catch (err) {
      setError('Failed to fetch admin details');
      console.error('Error fetching admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = { ...formData };
      
      // If editing and password is empty, don't include it in the request
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }

      if (isEdit) {
        await adminAPI.update(id, submitData);
        setSuccess('Admin updated successfully!');
      } else {
        await adminAPI.create(submitData);
        setSuccess('Admin created successfully!');
      }

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/list');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to save admin. Please try again.');
      }
      console.error('Error saving admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/list');
  };

  return (
    <MainCard title={isEdit ? 'Edit Admin' : 'Create Admin'}>
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
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            helperText={isEdit ? "Leave empty to keep current password" : ""}
            disabled={loading}
          />


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

export default AdminForm;
