import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Skeleton,
  Stack,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  Description as DocIcon,
  EventNote as EventIcon,
  Star as StarIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';

import { fetchNotifications } from '../api';
import { MinHeap } from '../utils/minHeap';
import { calculatePriority } from '../utils/priorityCalculator';

export default function PriorityNotifications({ readIds, setReadIds }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Size limit 'n' for the priority board
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Fetch a large enough batch to prioritize (e.g. 100 items)
        const result = await fetchNotifications({ limit: 100, page: 1 });
        const rawList = result.notifications || [];

        // Initialize MinHeap based on priorityScore
        const heap = new MinHeap((a, b) => a.priorityScore - b.priorityScore);

        // Process through heap to find Top N
        rawList.forEach((item) => {
          const priorityScore = calculatePriority(item);
          const entry = { ...item, priorityScore };

          if (heap.size() < topN) {
            heap.insert(entry);
          } else {
            const min = heap.peek();
            if (min && priorityScore > min.priorityScore) {
              heap.extractMin();
              heap.insert(entry);
            }
          }
        });

        // Extract and sort descending
        const topList = [];
        while (heap.size() > 0) {
          topList.push(heap.extractMin());
        }
        topList.sort((a, b) => b.priorityScore - a.priorityScore);

        setNotifications(topList);
      } catch (err) {
        setError(err.message || 'Failed to compute top priority notifications.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [topN]);

  // Mark single as read
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('viewed_notification_ids', JSON.stringify(updated));
    }
  };

  // Mark all currently listed priority items as read
  const markAllListedAsRead = () => {
    const listIds = notifications.map(n => n.ID);
    const newReadIds = [...new Set([...readIds, ...listIds])];
    setReadIds(newReadIds);
    localStorage.setItem('viewed_notification_ids', JSON.stringify(newReadIds));
  };

  // Icon selector
  const getTypeIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'placement':
        return <WorkIcon sx={{ color: '#818cf8' }} />;
      case 'result':
        return <DocIcon sx={{ color: '#38bdf8' }} />;
      case 'event':
        return <EventIcon sx={{ color: '#fb923c' }} />;
      default:
        return <StarIcon />;
    }
  };

  // Color selector
  const getTypeColor = (type) => {
    switch (String(type).toLowerCase()) {
      case 'placement':
        return { bg: 'rgba(129, 140, 248, 0.15)', text: '#818cf8' };
      case 'result':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' };
      case 'event':
        return { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff' };
    }
  };

  return (
    <Box>
      {/* Header with control select */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ color: '#f59e0b' }} />
          Priority Board
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<CheckIcon />}
              onClick={markAllListedAsRead}
              color="secondary"
            >
              Mark Board as Read
            </Button>
          )}

          {/* Select N parameter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="top-n-label">Show Top N</InputLabel>
            <Select
              labelId="top-n-label"
              value={topN}
              label="Show Top N"
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Notifications grid list */}
      <Grid container spacing={2}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(topN)).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="rectangular" width={100} height={24} rx={4} />
                  <Skeleton variant="text" width={120} />
                </Box>
                <Skeleton variant="text" width="60%" height={30} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Box>
              </Card>
            </Grid>
          ))
        ) : notifications.length === 0 ? (
          // Empty State
          <Grid item xs={12}>
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No notification data is available at the moment.
              </Typography>
            </Box>
          </Grid>
        ) : (
          // Priority cards
          notifications.map((n, index) => {
            const isRead = readIds.includes(n.ID);
            const chipColors = getTypeColor(n.Type);
            return (
              <Grid item xs={12} key={n.ID}>
                <Card
                  onClick={() => markAsRead(n.ID)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    borderLeft: isRead ? '4px solid transparent' : '4px solid #f59e0b',
                    backgroundColor: isRead ? 'rgba(30, 41, 59, 0.4)' : '#1e293b',
                    border: isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(245, 158, 11, 0.15)',
                    '&:hover': {
                      backgroundColor: isRead ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={getTypeIcon(n.Type)}
                          label={`${n.Type}`}
                          size="small"
                          sx={{
                            backgroundColor: chipColors.bg,
                            color: chipColors.text,
                            fontWeight: 600,
                            borderRadius: '6px',
                            '& .MuiChip-icon': { color: 'inherit' }
                          }}
                        />
                        <Chip
                          label={`Rank #${index + 1}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                          }}
                        />
                        {!isRead && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                            }}
                          />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {n.Timestamp}
                        </Typography>
                        <Chip
                          label={`Score: ${Number(n.priorityScore).toFixed(2)}`}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          }}
                        />
                      </Stack>
                    </Stack>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isRead ? 400 : 600,
                        color: isRead ? 'text.secondary' : 'text.primary',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.Message}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                    {!isRead ? (
                      <Button
                        size="small"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.ID);
                        }}
                      >
                        Mark as Read
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckIcon fontSize="inherit" color="success" /> Read
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}
