import { Outlet, useLocation } from 'react-router-dom';
import { Box, Fade, Typography, useTheme, alpha, keyframes } from '@mui/material';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import WebsiteHeader from '../../components/website/WebsiteHeader';
import WebsiteFooter from '../../components/website/WebsiteFooter';
import { useLoading } from '../../contexts/LoadingContext';

// ==============================|| PAGE LOADER ||============================== //

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.primary.main, 0.03)} 100%
        )`,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          zIndex: -1
        }
      }}
    >
      {/* Floating Brand Container */}
      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center',
          animation: `${fadeInUp} 0.8s ease-out`,
          position: 'relative'
        }}
      >
        {/* Animated Background */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            background: `linear-gradient(
              90deg,
              transparent,
              ${alpha(theme.palette.primary.main, 0.1)},
              transparent
            )`,
            backgroundSize: '200px 100%',
            animation: `${shimmer} 2s infinite`,
            borderRadius: 4,
            zIndex: -1
          }}
        />
        
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: `linear-gradient(135deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.secondary.main} 50%, 
              ${theme.palette.primary.dark} 100%
            )`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            letterSpacing: -1,
            animation: `${float} 3s ease-in-out infinite`
          }}
        >
          Palets
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            opacity: 0.8
          }}
        >
          Art Gallery & Studio
        </Typography>
      </Box>

      {/* Modern Loading Animation */}
      <Box 
        sx={{ 
          position: 'relative', 
          width: 120, 
          height: 120, 
          mb: 4,
          animation: `${fadeInUp} 0.8s ease-out 0.2s both`
        }}
      >
        {/* Outer Ring */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: '50%'
          }}
        />
        
        {/* Animated Ring */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `2px solid transparent`,
            borderTop: `2px solid ${theme.palette.primary.main}`,
            borderRight: `2px solid ${theme.palette.secondary.main}`,
            borderRadius: '50%',
            animation: `${spin} 2s linear infinite`
          }}
        />
        
        {/* Inner Dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 12,
            height: 12,
            bgcolor: theme.palette.primary.main,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `${float} 2s ease-in-out infinite`
          }}
        />
        
        {/* Progress Dots */}
        {[0, 1, 2, 3, 4].map((index) => {
          const angle = (index * 72) * (Math.PI / 180);
          const x = 45 * Math.cos(angle);
          const y = 45 * Math.sin(angle);
          
          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 6,
                height: 6,
                bgcolor: theme.palette.primary.main,
                borderRadius: '50%',
                transform: `translate(${x - 3}px, ${y - 3}px)`,
                opacity: 0.3,
                animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`
              }}
            />
          );
        })}
      </Box>

      {/* Loading Text with Animation */}
      <Box
        sx={{
          textAlign: 'center',
          animation: `${fadeInUp} 0.8s ease-out 0.4s both`
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600,
            mb: 1,
            fontSize: '1.1rem'
          }}
        >
          Loading amazing artworks...
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: '0.875rem',
            opacity: 0.7
          }}
        >
          Preparing your creative journey
        </Typography>
      </Box>
    </Box>
  );
};

// ==============================|| MINIMAL LAYOUT ||============================== //

export default function MinimalLayout() {
  const location = useLocation();
  const { isContentReady, resetContentReady } = useLoading();
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  // Handle loading screen - Wait for content to load
  useEffect(() => {
    if (location.pathname === '/') {
      console.log('Home page detected - showing loading screen');
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
      resetContentReady(); // Reset content ready state
      
      const minLoadTime = 800; // 0.8 seconds minimum (much faster)
      const maxLoadTime = 3000; // 3 seconds maximum
      const startTime = Date.now();
      
      const hideLoading = () => {
        console.log('Hiding loading screen - content ready');
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      };
      
      // Check periodically if content is loaded
      const checkInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        
        console.log('Loading check:', { 
          elapsedTime, 
          isContentReady, 
          minTimePassed: elapsedTime >= minLoadTime,
          maxTimeReached: elapsedTime >= maxLoadTime
        });
        
        // Hide loading if:
        // 1. Minimum time has passed AND content is ready
        // 2. OR maximum time has been reached
        if ((elapsedTime >= minLoadTime && isContentReady) || elapsedTime >= maxLoadTime) {
          clearInterval(checkInterval);
          hideLoading();
        }
      }, 50); // Check every 50ms (faster checking)
      
      return () => {
        clearInterval(checkInterval);
        document.body.style.overflow = 'unset';
      };
    }
  }, [location.pathname, isContentReady, resetContentReady]);

  return (
    <>
      {/* Loading Screen for First Visit */}
      {isLoading && createPortal(<PageLoader />, document.body)}
      
      {/* Main Layout */}
      <Fade in={!isLoading} timeout={400}>
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
