import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  height: '100%',
}));

const SocialMediaManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Social Media Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Platform Overview
            </Typography>
            <Typography variant="body1" paragraph>
              Monitor and manage your social media presence across multiple platforms.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Engagement Metrics
            </Typography>
            <Typography variant="body1" paragraph>
              Track likes, shares, comments, and overall engagement rates.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Instagram: New post performance analysis</Typography>
              <Typography>Twitter: Trending hashtags report</Typography>
              <Typography>LinkedIn: Business engagement summary</Typography>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SocialMediaManagement;