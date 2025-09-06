import { Outlet, useLocation } from 'react-router-dom';
import { Box, Fade, Typography, useTheme, alpha } from '@mui/material';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import WebsiteHeader from '../../components/website/WebsiteHeader';
import WebsiteFooter from '../../components/website/WebsiteFooter';

// ==============================|| PAGE LOADER ||============================== //

const PageLoader = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        transition: 'opacity 0.5s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Palets
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: 1
          }}
        >
          Art Gallery & Studio
        </Typography>
      </Box>

      {/* Animated Loading Circles */}
      <Box sx={{ position: 'relative', width: 80, height: 80, mb: 3 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderTop: `3px solid ${theme.palette.primary.main}`,
              borderRadius: '50%',
              animation: `spin 1.5s linear infinite`,
              animationDelay: `${index * 0.2}s`,
              transform: `scale(${1 - index * 0.2})`,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        ))}
      </Box>

      {/* Loading Text */}
      <Typography 
        variant="body1" 
        sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 500,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 }
          }
        }}
      >
        Loading amazing artworks...
      </Typography>
    </Box>
  );
};

// ==============================|| MINIMAL LAYOUT ||============================== //

export default function MinimalLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only show loading for home page
    if (location.pathname === '/') {
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
      
      // Hide loading after a delay to allow content to load
      const timer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      }, 2000); // 2 seconds loading time
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [location.pathname]);

  return (
    <>
      {/* Loading Screen for Home Page */}
      {isLoading && createPortal(<PageLoader />, document.body)}
      
      {/* Main Layout */}
      <Fade in={!isLoading} timeout={800}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <WebsiteHeader />
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
          <WebsiteFooter />
        </Box>
      </Fade>
    </>
  );
}
