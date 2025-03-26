import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleFirstTimeLogin = () => {
    navigate('/auth');
  };

  const handleReturningUser = () => {
    navigate('/auth', { state: { isFirstTime: false } });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Please select your login type to continue
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleFirstTimeLogin}
            >
              First Time Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleReturningUser}
            >
              Returning User
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;