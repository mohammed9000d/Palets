import React from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';

const TableLoading = ({ title = "Loading..." }) => {
  return (
    <MainCard title={title}>
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading data...
        </Typography>
      </Box>
    </MainCard>
  );
};

export default TableLoading;
