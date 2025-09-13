import React from 'react';
import {
  Card,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';

const TableSearch = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search...",
  filters = [],
  children 
}) => {
  return (
    <Card sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Input */}
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
            }}
          />
        </Grid>
        
        {/* Custom Filters */}
        {children}
        
        {/* Standard Filters */}
        {filters.map((filter, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FormControl fullWidth size="small">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filter.value}
                onChange={filter.onChange}
                label={filter.label}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                  },
                }}
              >
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
};

export default TableSearch;
