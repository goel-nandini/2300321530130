import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Button, Select, MenuItem,
  FormControl, InputLabel, Skeleton, Stack, Alert,
} from '@mui/material';
import { Star as StarIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

import { fetchNotifications } from '../api';
import { MinHeap } from '../utils/minHeap';
import { calculatePriority } from '../utils/priorityCalculator';
import NotificationCard from './NotificationCard';

const persistRead = (ids) =>
  localStorage.setItem('viewed_notification_ids', JSON.stringify(ids));

export default function PriorityNotifications({ readIds, setReadIds }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [topN, setTopN]                   = useState(10);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Fetch a large batch and apply MinHeap selection client-side
        const result = await fetchNotifications({ limit: 100, page: 1 });
        const raw = result.notifications || [];

        const heap = new MinHeap((a, b) => a.priorityScore - b.priorityScore);

        raw.forEach((item) => {
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

        // Drain heap and sort descending
        const topList = [];
        while (heap.size() > 0) topList.push(heap.extractMin());
        topList.sort((a, b) => b.priorityScore - a.priorityScore);

        if (!cancelled) setNotifications(topList);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to compute priority notifications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [topN]);

  const markAsRead = (id) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    persistRead(next);
  };

  const markBoardAsRead = () => {
    const next = [...new Set([...readIds, ...notifications.map(n => n.ID)])];
    setReadIds(next);
    persistRead(next);
  };

  return (
    <Box>
      {/* ── Controls row ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
            Priority Board
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Top {topN} notifications ranked by type weight + recency score
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {notifications.length > 0 && (
            <Button variant="outlined" size="small" color="secondary"
              startIcon={<CheckIcon />} onClick={markBoardAsRead}>
              Mark All Read
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="top-n-label">Show Top N</InputLabel>
            <Select labelId="top-n-label" value={topN} label="Show Top N"
              onChange={(e) => setTopN(Number(e.target.value))}>
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* ── Card list ── */}
      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: topN }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rounded" height={96} animation="wave" />
            </Grid>
          ))
        ) : notifications.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{
              py: 8, textAlign: 'center', borderRadius: 3,
              border: '1px dashed rgba(255,255,255,0.1)',
              backgroundColor: 'background.paper',
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No notification data is available at the moment.
              </Typography>
            </Box>
          </Grid>
        ) : (
          notifications.map((n, index) => (
            <Grid item xs={12} key={n.ID}>
              <NotificationCard
                notification={n}
                isRead={readIds.includes(n.ID)}
                onMarkRead={markAsRead}
                rank={index + 1}
                score={n.priorityScore}
                accentColor="#f59e0b"
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
