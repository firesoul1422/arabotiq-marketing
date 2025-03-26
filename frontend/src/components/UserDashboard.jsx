import React from 'react';
import { Box, Container, Grid, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
}));

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Active Campaigns
            </Typography>
            <Typography variant="h3">5</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Social Media Reach
            </Typography>
            <Typography variant="h3">10.5K</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Content Performance
            </Typography>
            <Typography variant="h3">89%</Typography>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Campaign "Summer Sale" launched</Typography>
              <Typography>New market analysis report available</Typography>
              <Typography>Social media engagement increased by 25%</Typography>
            </Box>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => navigate('/services/market-analysis')}>Market Analysis</Button>
              <Button variant="contained" onClick={() => navigate('/services/content-generation')}>Content Generation</Button>
              <Button variant="contained" onClick={() => navigate('/services/social-media')}>Social Media</Button>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;