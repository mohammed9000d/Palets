import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from '@tabler/icons-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  color = 'primary',
  trend,
  trendValue,
  progress,
  isLoading = false,
  prefix = '',
  suffix = '',
  variant = 'default'
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend === 'up') {
      return <IconTrendingUp size={16} color={theme.palette.success.main} />;
    } else if (trend === 'down') {
      return <IconTrendingDown size={16} color={theme.palette.error.main} />;
    } else {
      return <IconMinus size={16} color={theme.palette.grey[500]} />;
    }
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'default';
  };

  const formatValue = (val) => {
    // Convert to number if it's a string
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    if (typeof numVal === 'number' && !isNaN(numVal)) {
      if (numVal >= 1000000) {
        return `${(numVal / 1000000).toFixed(1)}M`;
      } else if (numVal >= 1000) {
        return `${(numVal / 1000).toFixed(1)}K`;
      }
      return numVal.toLocaleString();
    }
    return val || '0';
  };

  if (variant === 'gradient') {
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: `0 8px 32px ${theme.palette[color].main}25`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                {prefix}{formatValue(value)}{suffix}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {IconComponent && (
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  width: 56,
                  height: 56,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <IconComponent size={28} />
              </Avatar>
            )}
          </Box>
          
          {trend && trendValue !== undefined && trendValue > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              {getTrendIcon()}
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {trendValue}% from last month
              </Typography>
            </Box>
          )}
          
          {progress !== undefined && (
            <Box mt={2}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="body2" color="textSecondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`} sx={{ letterSpacing: '-0.5px' }}>
              {isLoading ? '...' : `${prefix}${formatValue(value)}${suffix}`}
            </Typography>
          </Box>
          {IconComponent && (
            <Avatar
              sx={{
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                width: 56,
                height: 56
              }}
            >
              <IconComponent size={28} />
            </Avatar>
          )}
        </Box>

        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {trend && trendValue !== undefined && trendValue > 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getTrendIcon()}
              label={`${trendValue}%`}
              size="small"
              color={getTrendColor()}
              variant="outlined"
            />
            <Typography variant="caption" color="textSecondary">
              vs last month
            </Typography>
          </Box>
        )}

        {progress !== undefined && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="textSecondary" fontWeight={500}>
                Progress
              </Typography>
              <Typography variant="caption" color="textSecondary" fontWeight={600}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
