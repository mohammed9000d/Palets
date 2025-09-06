import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandFacebook,
  IconMail,
  IconPhone,
  IconMapPin,
  IconPalette
} from '@tabler/icons-react';

const WebsiteFooter = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', pt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <IconPalette size={28} color="#2196F3" />
              <Typography variant="h5" fontWeight="bold">
                Palets
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400" paragraph>
              Discover unique art panel collections from talented artists around the world. 
              Transform your space with carefully curated artistic expressions.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ color: 'grey.400', '&:hover': { color: '#E1306C' } }}>
                <IconBrandInstagram />
              </IconButton>
              <IconButton sx={{ color: 'grey.400', '&:hover': { color: '#1DA1F2' } }}>
                <IconBrandTwitter />
              </IconButton>
              <IconButton sx={{ color: 'grey.400', '&:hover': { color: '#4267B2' } }}>
                <IconBrandFacebook />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Explore
            </Typography>
            <Stack spacing={1}>
              <Link href="/galleries" color="grey.400" underline="hover">
                Art Galleries
              </Link>
              <Link href="/products" color="grey.400" underline="hover">
                Panel Products
              </Link>
              <Link href="/artists" color="grey.400" underline="hover">
                Featured Artists
              </Link>
              <Link href="/news" color="grey.400" underline="hover">
                Latest News
              </Link>
            </Stack>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Services
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="grey.400" underline="hover">
                Custom Commissions
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Art Consultation
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Installation Services
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Shipping & Returns
              </Link>
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Us
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconMail size={16} />
                <Typography variant="body2" color="grey.400">
                  info@palets.com
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconPhone size={16} />
                <Typography variant="body2" color="grey.400">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconMapPin size={16} />
                <Typography variant="body2" color="grey.400">
                  123 Art Street, Creative District
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        {/* Bottom Footer */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
        >
          <Typography variant="body2" color="grey.500">
            © 2024 Palets. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="#" color="grey.500" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="#" color="grey.500" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="#" color="grey.500" underline="hover" variant="body2">
              Cookie Policy
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default WebsiteFooter;
