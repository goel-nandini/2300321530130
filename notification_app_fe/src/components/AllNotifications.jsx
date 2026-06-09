import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Button, Select, MenuItem,
  FormControl, InputLabel, Pagination, Skeleton, Stack, Alert,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

import { fetchNotifications } from '../api';
import NotificationCard from './NotificationCard';

const persistRead = (ids) =>
  localStorage.setItem('viewed_notification_ids', JSON.stringify(ids));

export default function AllNotifications({ readIds, setReadIds }) {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount]       = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(5);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await fetchNotifications({
          limit,
          page,
          notification_type: typeFilter === 'All' ? undefined : typeFilter,
        });
        if (!cancelled) {
          setNotifications(result.notifications);
          setTotalCount(result.totalCount);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch notifications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, limit, typeFilter]);

  const handleFilterChange = (e) => { setTypeFilter(e.target.value); setPage(1); };
  const handleLimitChange  = (e) => { setLimit(Number(e.target.value)); setPage(1); };

  const markAsRead = (id) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    persistRead(next);
  };

  const markPageAsRead = () => {
    const next = [...new Set([...readIds, ...notifications.map(n => n.ID)])];
    setReadIds(next);
    persistRead(next);
  };

  const pageCount = Math.ceil(totalCount / limit);

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
          <Typography variant="h4">Inbox</Typography>
          {!loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {totalCount} notification{totalCount !== 1 ? 's' : ''} ·{' '}
              {Math.max(0, totalCount - readIds.length)} unread
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {notifications.length > 0 && (
            <Button variant="outlined" size="small" startIcon={<CheckIcon />}
              onClick={markPageAsRead}>
              Mark Page Read
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="filter-type-label">Type</InputLabel>
            <Select labelId="filter-type-label" value={typeFilter}
              label="Type" onChange={handleFilterChange}>
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 85 }}>
            <InputLabel id="limit-label">Show</InputLabel>
            <Select labelId="limit-label" value={limit}
              label="Show" onChange={handleLimitChange}>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* ── Card list ── */}
      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: limit }).map((_, i) => (
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
                No Notifications Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing the type filter or page.
              </Typography>
            </Box>
          </Grid>
        ) : (
          notifications.map((n) => (
            <Grid item xs={12} key={n.ID}>
              <NotificationCard
                notification={n}
                isRead={readIds.includes(n.ID)}
                onMarkRead={markAsRead}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* ── Pagination ── */}
      {pageCount > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={pageCount} page={page}
            onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
