import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Chip
} from '@mui/material';
import {
  IconSettings,
  IconPalette,
  IconPhoto,
  IconUpload,
  IconDeviceFloppy,
  IconRefresh
} from '@tabler/icons-react';
import MainCard from '../../ui-component/cards/MainCard';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Palets Admin',
    siteDescription: 'Art Gallery Management System',
    logo: null,
    primaryColor: '#1976d2',
    secondaryColor: '#00acc1',
    successColor: '#4caf50',
    errorColor: '#e53935',
    warningColor: '#ff9800',
    darkMode: false,
    itemsPerPage: 15,
    autoSave: true,
    showAnimations: true
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const colorPresets = [
    { name: 'Default Blue', primary: '#1976d2', secondary: '#00acc1' },
    { name: 'Purple Elegance', primary: '#7b1fa2', secondary: '#e91e63' },
    { name: 'Green Nature', primary: '#388e3c', secondary: '#ff8f00' },
    { name: 'Orange Sunset', primary: '#f57c00', secondary: '#d32f2f' },
    { name: 'Teal Ocean', primary: '#00695c', secondary: '#1976d2' },
    { name: 'Indigo Night', primary: '#303f9f', secondary: '#7b1fa2' }
  ];

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setSettings(prev => ({
          ...prev,
          logo: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Here you would typically save to your backend
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      siteName: 'Palets Admin',
      siteDescription: 'Art Gallery Management System',
      logo: null,
      primaryColor: '#1976d2',
      secondaryColor: '#00acc1',
      successColor: '#4caf50',
      errorColor: '#e53935',
      warningColor: '#ff9800',
      darkMode: false,
      itemsPerPage: 15,
      autoSave: true,
      showAnimations: true
    });
    setLogoPreview(null);
  };

  return (
    <MainCard
      title="Dashboard Settings"
      secondary={
        <Button
          variant="contained"
          startIcon={<IconDeviceFloppy />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      }
    >
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

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconSettings size={20} />
                General Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
                
                <TextField
                  fullWidth
                  label="Site Description"
                  multiline
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Items Per Page</InputLabel>
                  <Select
                    value={settings.itemsPerPage}
                    onChange={(e) => handleInputChange('itemsPerPage', e.target.value)}
                    label="Items Per Page"
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                      />
                    }
                    label="Auto Save"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showAnimations}
                        onChange={(e) => handleInputChange('showAnimations', e.target.checked)}
                      />
                    }
                    label="Animations"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Logo Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconPhoto size={20} />
                Logo & Branding
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={3} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={logoPreview}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      border: '3px dashed',
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light'
                    }}
                  >
                    <IconPhoto size={40} />
                  </Avatar>
                  
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      fullWidth
                    >
                      Upload Logo
                    </Button>
                  </label>
                  
                  <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                    Recommended: 200x200px, PNG or JPG
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Color Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconPalette size={20} />
                Color Theme
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Color Presets */}
              <Typography variant="subtitle2" gutterBottom>
                Quick Presets
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {colorPresets.map((preset, index) => (
                  <Chip
                    key={index}
                    label={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    sx={{
                      backgroundColor: preset.primary,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: preset.secondary
                      }
                    }}
                  />
                ))}
              </Stack>
              
              {/* Custom Colors */}
              <Typography variant="subtitle2" gutterBottom>
                Custom Colors
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Secondary Color"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Success Color"
                    type="color"
                    value={settings.successColor}
                    onChange={(e) => handleInputChange('successColor', e.target.value)}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Error Color"
                    type="color"
                    value={settings.errorColor}
                    onChange={(e) => handleInputChange('errorColor', e.target.value)}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Warning Color"
                    type="color"
                    value={settings.warningColor}
                    onChange={(e) => handleInputChange('warningColor', e.target.value)}
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* Color Preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: settings.successColor }}
                  >
                    Success
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: settings.errorColor }}
                  >
                    Error
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: settings.warningColor }}
                  >
                    Warning
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<IconRefresh />}
              onClick={resetToDefaults}
              color="secondary"
            >
              Reset to Defaults
            </Button>
            
            <Button
              variant="contained"
              startIcon={<IconDeviceFloppy />}
              onClick={handleSave}
              disabled={loading}
              size="large"
            >
              {loading ? 'Saving...' : 'Save All Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Settings;
