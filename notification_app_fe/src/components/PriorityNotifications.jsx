import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PriorityNotifications() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Priority Notifications
      </Typography>
      <Typography variant="body1">
        This page will show the top N priority notifications calculated using the MinHeap algorithm.
      </Typography>
    </Box>
  );
}
