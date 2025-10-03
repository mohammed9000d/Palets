import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  IconPackage,
  IconTrendingUp,
  IconEye,
  IconEdit
} from '@tabler/icons-react';

const TopProducts = ({ data, isLoading = false }) => {
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toString() || '0';
  };

  const getProgressColor = (index) => {
    if (index === 0) return 'success';
    if (index === 1) return 'primary';
    if (index === 2) return 'secondary';
    return 'default';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography>Loading top products...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data?.top_selling_products?.length) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Selling Products
          </Typography>
          <Box textAlign="center" py={4}>
            <IconPackage size={48} style={{ opacity: 0.3 }} />
            <Typography variant="body2" color="textSecondary" mt={2}>
              No sales data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const maxSold = Math.max(...data.top_selling_products.map(p => p.total_sold));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Top Selling Products
          </Typography>
          <Chip
            icon={<IconTrendingUp size={16} />}
            label="Best Sellers"
            color="success"
            variant="outlined"
            size="small"
          />
        </Box>

        <List>
          {data.top_selling_products.slice(0, 10).map((item, index) => {
            const product = item.product;
            const progressValue = maxSold > 0 ? (item.total_sold / maxSold) * 100 : 0;
            
            return (
              <ListItem
                key={item.product_id}
                sx={{
                  px: 0,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getProgressColor(index)}.light`,
                      color: `${getProgressColor(index)}.main`,
                      fontWeight: 'bold'
                    }}
                  >
                    #{index + 1}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {product?.main_title || product?.title || `Product #${item.product_id}`}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          by {product?.artist?.artist_name || 'Unknown Artist'}
                        </Typography>
                        {product?.status && (
                          <Chip
                            label={product.status}
                            size="small"
                            color={product.status === 'published' ? 'success' : 'warning'}
                            sx={{ fontSize: '0.6rem', height: '16px' }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Sales Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {formatNumber(item.total_sold)} sold
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        color={getProgressColor(index)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover'
                        }}
                      />
                    </Box>
                  }
                />

                <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {item.total_sold}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    units
                  </Typography>
                  
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="View Product">
                      <IconButton size="small">
                        <IconEye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                      <IconButton size="small">
                        <IconEdit size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {/* Summary Stats */}
        <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Sales Summary
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {data.total_products_sold || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Units Sold
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="secondary">
                {data.top_selling_products.length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Products with Sales
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {data.average_product_rating && typeof data.average_product_rating === 'number' 
                  ? data.average_product_rating.toFixed(1) 
                  : 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg Rating
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopProducts;
