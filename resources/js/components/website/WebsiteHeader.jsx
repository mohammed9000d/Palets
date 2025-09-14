import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  alpha
} from '@mui/material';
import {
  IconMenu2,
  IconPalette,
  IconShoppingCart,
  IconNews,
  IconUsers,
  IconHome,
  IconLogin,
  IconUserPlus,
  IconUser,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CartIcon from '../cart/CartIcon';

const WebsiteHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log('User data in WebsiteHeader:', user);
      console.log('User avatar:', user.avatar);
    }
  }, [user]);

  const navigationItems = [
    { label: 'Home', path: '/', icon: IconHome },
    { label: 'Galleries', path: '/galleries', icon: IconPalette },
    { label: 'Products', path: '/products', icon: IconShoppingCart },
    { label: 'Artists', path: '/artists', icon: IconUsers },
    { label: 'Articles', path: '/articles', icon: IconNews },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold' }}>
        Palets
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <Button
              component={Link}
              to={item.path}
              fullWidth
              startIcon={<item.icon />}
              onClick={handleDrawerToggle}
              sx={{
                justifyContent: 'flex-start',
                px: 2,
                py: 1,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary'
              }}
            >
              <ListItemText primary={item.label} />
            </Button>
          </ListItem>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Mobile Auth Buttons */}
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <Button
                component={Link}
                to="/profile"
                fullWidth
                startIcon={<IconUser />}
                onClick={handleDrawerToggle}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  color: 'text.primary'
                }}
              >
                <ListItemText primary="Profile" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                fullWidth
                startIcon={<IconLogout />}
                onClick={() => {
                  handleDrawerToggle();
                  handleLogout();
                }}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  color: 'text.primary'
                }}
              >
                <ListItemText primary="Logout" />
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <Button
                component={Link}
                to="/login"
                fullWidth
                startIcon={<IconLogin />}
                onClick={handleDrawerToggle}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  color: 'primary.main'
                }}
              >
                <ListItemText primary="Sign In" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                component={Link}
                to="/register"
                fullWidth
                startIcon={<IconUserPlus />}
                onClick={handleDrawerToggle}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  color: 'primary.main'
                }}
              >
                <ListItemText primary="Sign Up" />
              </Button>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 0 } }}>
            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                mr: 4
              }}
            >
              Palets
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    startIcon={<item.icon size={18} />}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Cart Icon */}
            <Box sx={{ mr: '10px' }}>
              <CartIcon />
            </Box>

            {/* Authentication Section */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    p: 0,
                    border: `2px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  <Avatar
                    src={user?.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Welcome back!
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  startIcon={<IconLogin size={16} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  startIcon={<IconUserPlus size={16} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 2, color: 'text.primary' }}
              >
                <IconMenu2 />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <MenuItem
          component={Link}
          to="/profile"
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <IconUser size={20} style={{ marginRight: 12 }} />
          My Profile
        </MenuItem>
        
        <MenuItem
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <IconSettings size={20} style={{ marginRight: 12 }} />
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <IconLogout size={20} style={{ marginRight: 12 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default WebsiteHeader;
