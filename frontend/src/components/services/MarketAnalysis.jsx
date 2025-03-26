import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  height: '100%',
}));

const MarketAnalysis = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Analysis
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Market Overview
            </Typography>
            <Typography variant="body1" paragraph>
              Comprehensive analysis of market trends, competitor insights, and industry developments.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Typography variant="body1" paragraph>
              Track market share, growth opportunities, and competitive positioning.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Q1 2024 Market Analysis Report</Typography>
              <Typography>Competitor Landscape Overview</Typography>
              <Typography>Industry Trends Analysis</Typography>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MarketAnalysis;