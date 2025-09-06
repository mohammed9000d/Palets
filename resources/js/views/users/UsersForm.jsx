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
import { usersAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const UsersForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    newsletter_subscription: false,
    sms_notifications: false,
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      // If user data was passed through navigation state, use it
      if (location.state?.user) {
        const user = location.state.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '', // Don't populate password for security
          phone: user.phone || '',
          newsletter_subscription: user.newsletter_subscription || false,
          sms_notifications: user.sms_notifications || false,
          is_active: user.is_active !== undefined ? user.is_active : true
        });
      } else {
        // Otherwise fetch from API
        fetchUser();
      }
    }
  }, [id, isEdit, location.state]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(id);
      const user = response.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        newsletter_subscription: user.newsletter_subscription || false,
        sms_notifications: user.sms_notifications || false,
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    } catch (err) {
      setError('Failed to fetch user details');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' || name === 'newsletter_subscription' || name === 'sms_notifications' ? checked : value
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
        await usersAPI.update(id, submitData);
        setSuccess('User updated successfully!');
      } else {
        await usersAPI.create(submitData);
        setSuccess('User created successfully!');
      }

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to save user. Please try again.');
      }
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <MainCard title={isEdit ? 'Edit User' : 'Create User'}>
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

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
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

          <FormControlLabel
            control={
              <Switch
                name="newsletter_subscription"
                checked={formData.newsletter_subscription}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Newsletter Subscription"
          />

          <FormControlLabel
            control={
              <Switch
                name="sms_notifications"
                checked={formData.sms_notifications}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="SMS Notifications"
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

export default UsersForm;
