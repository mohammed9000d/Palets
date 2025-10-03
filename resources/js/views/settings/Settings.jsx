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
  Switch,
  FormControlLabel,
  Stack,
  Paper,
  Snackbar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  IconSettings,
  IconPhoto,
  IconUpload,
  IconDeviceFloppy,
  IconTrash,
  IconWorld,
  IconMoon,
  IconSun,
  IconBrandTabler
} from '@tabler/icons-react';
import MainCard from '../../ui-component/cards/MainCard';
import { useSettings } from '../../contexts/SettingsContext';

const Settings = () => {
  const { settings: globalSettings, loading: globalLoading, error: globalError, updateSettings, deleteFile, setError } = useSettings();
  
  const [localSettings, setLocalSettings] = useState({
    site_name: '',
    site_description: '',
    logo: null,
    favicon: null,
    dark_mode: false
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);

  // Sync global settings to local state
  useEffect(() => {
    if (globalSettings) {
      setLocalSettings({
        site_name: globalSettings.site_name || '',
        site_description: globalSettings.site_description || '',
        logo: null, // Don't set file objects from server
        favicon: null,
        dark_mode: globalSettings.dark_mode || false
      });
      setLogoPreview(globalSettings.logo);
      setFaviconPreview(globalSettings.favicon);
    }
  }, [globalSettings]);

  const handleInputChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      const maxSize = type === 'favicon' ? 1024 * 1024 : 2048 * 1024; // 1MB for favicon, 2MB for logo
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File size too large. Maximum ${type === 'favicon' ? '1MB' : '2MB'} allowed.`,
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogoPreview(e.target.result);
        } else {
          setFaviconPreview(e.target.result);
        }
        setLocalSettings(prev => ({
          ...prev,
          [type]: file
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFile = async (type) => {
    try {
      const result = await deleteFile(type);
      if (result.success) {
        if (type === 'logo') {
          setLogoPreview(null);
        } else {
          setFaviconPreview(null);
        }
        setLocalSettings(prev => ({
          ...prev,
          [type]: null
        }));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete file',
        severity: 'error'
      });
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateSettings(localSettings);
      if (result.success) {
        setHasChanges(false);
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setError(null);
  };

  if (globalLoading) {
    return (
      <MainCard title="Settings">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <IconSettings size={24} />
            <Typography variant="h4">Website Settings</Typography>
          </Box>
        }
        secondary={
          <Button
            variant="contained"
            startIcon={globalLoading ? <CircularProgress size={16} /> : <IconDeviceFloppy />}
            onClick={handleSave}
            disabled={globalLoading || !hasChanges}
            sx={{ minWidth: 140 }}
          >
            {globalLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      >
        {(globalError || snackbar.severity === 'error') && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {globalError || snackbar.message}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* General Information */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconWorld size={20} />
                General Information
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={localSettings.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  placeholder="Enter your website name"
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Site Description"
                  multiline
                  rows={4}
                  value={localSettings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder="Describe your website"
                  variant="outlined"
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Theme Settings */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {localSettings.dark_mode ? <IconMoon size={20} /> : <IconSun size={20} />}
                Theme Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.dark_mode}
                    onChange={(e) => handleInputChange('dark_mode', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>Dark Mode</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {localSettings.dark_mode ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>

          {/* Logo Upload */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconBrandTabler size={20} />
                Website Logo
              </Typography>
              
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={logoPreview}
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: '2px dashed',
                    borderColor: logoPreview ? 'primary.main' : 'grey.300',
                    backgroundColor: logoPreview ? 'transparent' : 'grey.50'
                  }}
                >
                  {!logoPreview && <IconPhoto size={32} color="#999" />}
                </Avatar>
                
                <Stack direction="row" spacing={1}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      size="small"
                    >
                      Upload
                    </Button>
                  </label>
                  
                  {logoPreview && (
                    <Tooltip title="Delete logo">
                      <IconButton
                        onClick={() => handleDeleteFile('logo')}
                        color="error"
                        size="small"
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                
                <Typography variant="caption" color="textSecondary" textAlign="center">
                  Recommended: 200x200px, PNG/JPG, Max 2MB
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Favicon Upload */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconPhoto size={20} />
                Website Favicon
              </Typography>
              
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={faviconPreview}
                  sx={{ 
                    width: 64, 
                    height: 64,
                    border: '2px dashed',
                    borderColor: faviconPreview ? 'primary.main' : 'grey.300',
                    backgroundColor: faviconPreview ? 'transparent' : 'grey.50'
                  }}
                >
                  {!faviconPreview && <IconPhoto size={24} color="#999" />}
                </Avatar>
                
                <Stack direction="row" spacing={1}>
                  <input
                    accept="image/*,.ico"
                    style={{ display: 'none' }}
                    id="favicon-upload"
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                  />
                  <label htmlFor="favicon-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      size="small"
                    >
                      Upload
                    </Button>
                  </label>
                  
                  {faviconPreview && (
                    <Tooltip title="Delete favicon">
                      <IconButton
                        onClick={() => handleDeleteFile('favicon')}
                        color="error"
                        size="small"
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                
                <Typography variant="caption" color="textSecondary" textAlign="center">
                  Recommended: 32x32px, ICO/PNG, Max 1MB
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {hasChanges && (
          <Box mt={3} p={2} bgcolor="warning.light" borderRadius={1}>
            <Typography variant="body2" color="warning.dark">
              You have unsaved changes. Don't forget to save your settings.
            </Typography>
          </Box>
        )}
      </MainCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Settings;
