import React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';

const TablePagination = ({ 
  pagination, 
  onPageChange, 
  itemName = 'items',
  showFirstLast = true 
}) => {
  const theme = useTheme();
  const { current_page, last_page, total } = pagination;

  if (last_page <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (last_page <= maxVisible) {
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      if (current_page <= 3) {
        pages.push(1, 2, 3, 4, '...', last_page);
      } else if (current_page >= last_page - 2) {
        pages.push(1, '...', last_page - 3, last_page - 2, last_page - 1, last_page);
      } else {
        pages.push(1, '...', current_page - 1, current_page, current_page + 1, '...', last_page);
      }
    }
    
    return pages;
  };

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mt={3}
      sx={{
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      {/* Results Info */}
      <Typography variant="body2" color="text.secondary">
        Showing {((current_page - 1) * pagination.per_page) + 1} to {Math.min(current_page * pagination.per_page, total)} of {total} {itemName}
      </Typography>

      {/* Pagination Controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* First Page */}
        {showFirstLast && (
          <IconButton
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
            size="small"
            sx={{ 
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                borderColor: theme.palette.primary.main
              },
              '&:disabled': {
                borderColor: theme.palette.grey[300],
                backgroundColor: theme.palette.grey[100]
              }
            }}
          >
            <IconChevronsLeft size={16} />
          </IconButton>
        )}

        {/* Previous Page */}
        <IconButton
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          size="small"
          sx={{ 
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main
            },
            '&:disabled': {
              borderColor: theme.palette.grey[300],
              backgroundColor: theme.palette.grey[100]
            }
          }}
        >
          <IconChevronLeft size={16} />
        </IconButton>

        {/* Page Numbers */}
        <Stack direction="row" spacing={0.5}>
          {getVisiblePages().map((page, index) => (
            page === '...' ? (
              <Typography key={index} variant="body2" sx={{ px: 1, py: 0.5 }}>
                ...
              </Typography>
            ) : (
              <Chip
                key={page}
                label={page}
                onClick={() => onPageChange(page)}
                variant={current_page === page ? 'filled' : 'outlined'}
                color={current_page === page ? 'primary' : 'default'}
                size="small"
                sx={{
                  minWidth: 36,
                  height: 36,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: current_page === page ? 'none' : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  backgroundColor: current_page === page 
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : 'white',
                  color: current_page === page ? 'white' : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: current_page === page 
                      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                      : alpha(theme.palette.primary.main, 0.08),
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              />
            )
          ))}
        </Stack>

        {/* Next Page */}
        <IconButton
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          size="small"
          sx={{ 
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main
            },
            '&:disabled': {
              borderColor: theme.palette.grey[300],
              backgroundColor: theme.palette.grey[100]
            }
          }}
        >
          <IconChevronRight size={16} />
        </IconButton>

        {/* Last Page */}
        {showFirstLast && (
          <IconButton
            onClick={() => onPageChange(last_page)}
            disabled={current_page === last_page}
            size="small"
            sx={{ 
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                borderColor: theme.palette.primary.main
              },
              '&:disabled': {
                borderColor: theme.palette.grey[300],
                backgroundColor: theme.palette.grey[100]
              }
            }}
          >
            <IconChevronsRight size={16} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};

export default TablePagination;
