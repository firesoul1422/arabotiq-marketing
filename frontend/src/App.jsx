import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import Auth from './components/Auth';
import MarketAnalysis from './components/services/MarketAnalysis';
import ContentGeneration from './components/services/ContentGeneration';
import SocialMediaManagement from './components/services/SocialMediaManagement';
import OnboardingFlow from './components/OnboardingFlow';
import store from './store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/login" element={<Auth isFirstTime={false} onAuthSuccess={() => <Navigate to="/owner" />} />} />
            <Route path="/auth" element={<Auth isFirstTime={true} onAuthSuccess={() => <Navigate to="/onboarding" />} />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/services/market-analysis" element={<MarketAnalysis />} />
            <Route path="/services/content-generation" element={<ContentGeneration />} />
            <Route path="/services/social-media" element={<SocialMediaManagement />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;