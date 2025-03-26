import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  height: '100%',
}));

const ContentGeneration = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Generation
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Content Strategy
            </Typography>
            <Typography variant="body1" paragraph>
              Develop and implement effective content strategies aligned with your business goals.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Content Calendar
            </Typography>
            <Typography variant="body1" paragraph>
              Plan and schedule your content across different platforms and channels.
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Content
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography>Blog Post: "Top 10 Marketing Strategies"</Typography>
              <Typography>Social Media Campaign: "Spring Collection"</Typography>
              <Typography>Email Newsletter: "Monthly Updates"</Typography>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentGeneration;