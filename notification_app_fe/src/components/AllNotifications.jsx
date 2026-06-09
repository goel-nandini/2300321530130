import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AllNotifications() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        All Notifications
      </Typography>
      <Typography variant="body1">
        This page will show all notifications with pagination and filter options.
      </Typography>
    </Box>
  );
}
