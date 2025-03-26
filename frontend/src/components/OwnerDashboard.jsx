import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, List, ListItem, ListItemText, Switch, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  height: '100%',
}));

const OwnerDashboard = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', subscriptionEnd: '2024-02-20', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', subscriptionEnd: '2024-02-25', active: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', subscriptionEnd: '2024-01-15', active: false },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    subscriptionDays: 30
  });

  const handleAddUser = () => {
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + parseInt(newUser.subscriptionDays));
    
    const newUserData = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      subscriptionEnd: subscriptionEnd.toISOString().split('T')[0],
      active: true
    };

    setUsers([...users, newUserData]);
    setOpenDialog(false);
    setNewUser({ name: '', email: '', subscriptionDays: 30 });
    // TODO: Generate and send access URL to user's email
  };

  const handleGenerateUrl = (userId) => {
    // TODO: Generate new access URL for the user
    console.log(`Generating new URL for user ${userId}`);
  };

  const permissions = [
    { id: 1, name: 'Manage Users', enabled: true },
    { id: 2, name: 'View Analytics', enabled: true },
    { id: 3, name: 'Edit Content', enabled: false },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Owner Management Portal
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Subscription Management
            </Typography>
            <List>
              {users.map((user) => (
                <ListItem key={user.id} 
                  secondaryAction={
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleGenerateUrl(user.id)}
                        sx={{ mr: 1 }}
                      >
                        Generate URL
                      </Button>
                      <Switch
                        edge="end"
                        checked={user.active}
                      />
                    </Box>
                  }
                >
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <>
                        {user.email}<br />
                        Subscription ends: {user.subscriptionEnd}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => setOpenDialog(true)}
            >
              Add New Subscription
            </Button>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Name"
                  fullWidth
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="Subscription Duration (days)"
                  type="number"
                  fullWidth
                  value={newUser.subscriptionDays}
                  onChange={(e) => setNewUser({ ...newUser, subscriptionDays: e.target.value })}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleAddUser} variant="contained" color="primary">
                  Add User
                </Button>
              </DialogActions>
            </Dialog>
          </Item>
        </Grid>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Permissions Control
            </Typography>
            <List>
              {permissions.map((permission) => (
                <ListItem key={permission.id} secondaryAction={
                  <Switch
                    edge="end"
                    checked={permission.enabled}
                  />
                }>
                  <ListItemText primary={permission.name} />
                </ListItem>
              ))}
            </List>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              System Configuration
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                System Status: Active
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Last Backup: 2023-12-25 10:30 AM
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Storage Usage: 65%
              </Typography>
              <Button variant="contained" color="primary" sx={{ mr: 2, mt: 2 }}>
                Backup System
              </Button>
              <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
                System Settings
              </Button>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OwnerDashboard;