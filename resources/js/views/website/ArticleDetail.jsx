import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Avatar,
  Chip,
  Skeleton,
  Fade,
  Breadcrumbs,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  IconArrowLeft,
  IconCalendar,
  IconUser,
  IconShare,
  IconHeart,
  IconNews
} from '@tabler/icons-react';
import { publicNewsAPI } from '../../services/api';

const ArticleDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    if (id) {
      loadArticle();
      loadRelatedArticles();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await publicNewsAPI.getById(id);
      
      if (response.data.success) {
        setArticle(response.data.data);
      } else {
        navigate('/articles', { replace: true });
      }
    } catch (error) {
      console.error('Error loading article:', error);
      navigate('/articles', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async () => {
    try {
      const response = await publicNewsAPI.getAll({ per_page: 4 });
      if (response.data) {
        // Filter out current article and take first 3
        const filtered = (response.data.data || [])
          .filter(item => item.id !== parseInt(id))
          .slice(0, 3);
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error('Error loading related articles:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = '';
    return `${baseUrl}/storage/${imagePath}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.main_title,
        text: article?.sub_title,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mb: 4 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 4 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" height={24} />
            <Skeleton variant="text" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <IconNews size={64} color={theme.palette.text.secondary} />
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Article Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The article you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          component={Link}
          to="/articles"
          variant="contained"
          startIcon={<IconArrowLeft />}
        >
          Back to Articles
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 4 }}>
        <Container maxWidth="md">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Home
            </Link>
            <Link
              to="/articles"
              style={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Articles
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {article.main_title}
            </Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            component={Link}
            to="/articles"
            startIcon={<IconArrowLeft />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              mb: 3,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }
            }}
          >
            Back to Articles
          </Button>
        </Container>
      </Box>

      {/* Article Content */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Cover Image */}
            {article.cover_photo && (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(article.cover_photo)}
                  alt={article.main_title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}

            {/* Article Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                {article.main_title}
              </Typography>

              {article.sub_title && (
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                    mb: 3,
                    fontSize: '1.25rem'
                  }}
                >
                  {article.sub_title}
                </Typography>
              )}

              {/* Article Meta */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {article.author_photo ? (
                      <Avatar
                        src={getImageUrl(article.author_photo)}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
                        <IconUser size={20} />
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {article.author_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Author
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCalendar size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(article.created_at)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconShare size={16} />}
                    onClick={handleShare}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconHeart size={16} />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      color: theme.palette.error.main,
                      borderColor: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        borderColor: theme.palette.error.main
                      }
                    }}
                  >
                    Like
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />
            </Box>

            {/* Article Content */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  color: theme.palette.text.primary,
                  whiteSpace: 'pre-line'
                }}
              >
                {article.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 4,
                    color: theme.palette.text.primary
                  }}
                >
                  Related Articles
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {relatedArticles.map((relatedArticle) => (
                    <Box
                      key={relatedArticle.id}
                      component={Link}
                      to={`/articles/${relatedArticle.id}`}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {relatedArticle.cover_photo ? (
                          <Box
                            component="img"
                            src={getImageUrl(relatedArticle.cover_photo)}
                            alt={relatedArticle.main_title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <IconNews size={24} color={theme.palette.primary.main} />
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: theme.palette.text.primary,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {relatedArticle.main_title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1
                          }}
                        >
                          {relatedArticle.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(relatedArticle.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    component={Link}
                    to="/articles"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4
                    }}
                  >
                    View All Articles
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ArticleDetail;
