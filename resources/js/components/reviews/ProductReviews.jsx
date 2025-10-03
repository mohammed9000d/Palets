import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Button,
  TextField,
  Avatar,
  Divider,
  LinearProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  Skeleton,
  alpha
} from '@mui/material';
import {
  IconStar,
  IconEdit,
  IconTrash,
  IconUser,
  IconX
} from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { productReviewsAPI } from '../../services/api';

const ProductReviews = ({ product }) => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load reviews and user's review
  useEffect(() => {
    if (product?.id) {
      loadReviews();
      if (isAuthenticated) {
        loadUserReview();
      }
    }
  }, [product?.id, isAuthenticated, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await productReviewsAPI.getReviews(product.id, { page: currentPage });
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setStatistics(response.data.statistics);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadUserReview = async () => {
    try {
      const response = await productReviewsAPI.getUserReview(product.id);
      if (response.data.success) {
        setUserReview(response.data.review);
      }
    } catch (error) {
      console.error('Error loading user review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!formData.comment.trim() || formData.comment.length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let response;
      if (editingReview) {
        response = await productReviewsAPI.updateReview(product.id, editingReview.id, formData);
      } else {
        response = await productReviewsAPI.addReview(product.id, formData);
      }

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowReviewForm(false);
        setEditingReview(null);
        setFormData({ rating: 5, comment: '' });
        
        // Reload reviews and user review
        loadReviews();
        loadUserReview();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await productReviewsAPI.deleteReview(product.id, reviewId);
      if (response.data.success) {
        setSuccess('Review deleted successfully');
        loadReviews();
        loadUserReview();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const closeForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setFormData({ rating: 5, comment: '' });
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ mt: 6 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Stack spacing={3}>
          {[1, 2, 3].map((item) => (
            <Paper key={item} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} />
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
        Customer Reviews
      </Typography>

      {/* Review Statistics */}
      {statistics && (
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            {/* Overall Rating */}
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {parseFloat(statistics.average_rating).toFixed(1)}
              </Typography>
              <Rating value={parseFloat(statistics.average_rating) || 0} precision={0.1} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {statistics.total_reviews} review{statistics.total_reviews !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Rating Breakdown */}
            <Box sx={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
                    <Typography variant="body2">{rating}</Typography>
                    <IconStar size={16} fill={theme.palette.warning.main} color={theme.palette.warning.main} />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.rating_percentages[rating]}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.divider, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.warning.main,
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {statistics.rating_percentages[rating]}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Add Review Button / User's Review */}
      {isAuthenticated ? (
        <Box sx={{ mb: 4 }}>
          {userReview ? (
            <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Your Review
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  <IconUser size={20} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {userReview.user?.name || 'You'}
                    </Typography>
                    <Rating value={userReview.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {userReview.comment}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<IconEdit size={16} />}
                      onClick={() => handleEditReview(userReview)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<IconTrash size={16} />}
                      onClick={() => handleDeleteReview(userReview.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Button
              variant="contained"
              onClick={() => setShowReviewForm(true)}
              sx={{ mb: 2 }}
            >
              Write a Review
            </Button>
          )}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please log in to write a review for this product.
        </Alert>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Reviews List */}
      <Stack spacing={3}>
        {reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ width: 40, height: 40 }}>
                <IconUser size={20} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {review.user?.name || 'Anonymous'}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {review.comment}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.last_page}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingReview ? 'Edit Review' : 'Write a Review'}
          <IconButton onClick={closeForm}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Rating
            </Typography>
            <Rating
              value={formData.rating}
              onChange={(event, newValue) => setFormData({ ...formData, rating: newValue })}
              size="large"
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Comment
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your thoughts about this product..."
              helperText={`${formData.comment.length}/1000 characters (minimum 10)`}
              inputProps={{ maxLength: 1000 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeForm}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submitting || formData.comment.length < 10}
          >
            {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductReviews;
