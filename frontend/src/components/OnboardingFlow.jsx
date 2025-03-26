import React, { useState } from 'react';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
} from '@mui/material';

const steps = [
  'Business Information',
  'Product Details',
  'Social Media Integration',
  'Analytics Setup'
];

const OnboardingFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    businessGoal: '',
    description: '',
    products: [{ name: '', price: '', description: '' }],
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    googleAnalyticsId: ''
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      products: newProducts
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSubmit = () => {
    // TODO: Submit data to backend
    console.log('Submitting data:', formData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Business Goal"
              value={formData.businessGoal}
              onChange={(e) => handleInputChange('businessGoal', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Business Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {formData.products.map((product, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Product {index + 1}
                </Typography>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={product.description}
                  onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                  margin="normal"
                />
              </Paper>
            ))}
            <Button
              variant="outlined"
              onClick={() => setFormData(prev => ({
                ...prev,
                products: [...prev.products, { name: '', price: '', description: '' }]
              }))}
            >
              Add Another Product
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Facebook Page URL"
              value={formData.socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Twitter Profile URL"
              value={formData.socialMedia.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Instagram Profile URL"
              value={formData.socialMedia.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="LinkedIn Profile URL"
              value={formData.socialMedia.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              margin="normal"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Google Analytics ID"
              value={formData.googleAnalyticsId}
              onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
              margin="normal"
              helperText="Enter your Google Analytics tracking ID (e.g., UA-XXXXXXXXX-X)"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome! Let's set up your business profile
      </Typography>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent(activeStep)}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Container>
  );
};

export default OnboardingFlow;