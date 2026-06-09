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
  Pagination,
  Chip,
  Skeleton,
  Stack,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  Description as DocIcon,
  EventNote as EventIcon,
  Drafts as DraftsIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';

import { fetchNotifications } from '../api';

export default function AllNotifications({ readIds, setReadIds }) {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [typeFilter, setTypeFilter] = useState('All');

  // Load and fetch when state changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const queryType = typeFilter === 'All' ? undefined : typeFilter;
        const result = await fetchNotifications({
          limit,
          page,
          notification_type: queryType,
        });
        
        setNotifications(result.notifications);
        setTotalCount(result.totalCount);
      } catch (err) {
        setError(err.message || 'Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, limit, typeFilter]);

  // Reset page when filter or limit changes
  const handleFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Mark single as read
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('viewed_notification_ids', JSON.stringify(updated));
    }
  };

  // Mark all on current page as read
  const markPageAsRead = () => {
    const pageIds = notifications.map(n => n.ID);
    const newReadIds = [...new Set([...readIds, ...pageIds])];
    setReadIds(newReadIds);
    localStorage.setItem('viewed_notification_ids', JSON.stringify(newReadIds));
  };

  // Helper for type icons
  const getTypeIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'placement':
        return <WorkIcon sx={{ color: '#818cf8' }} />;
      case 'result':
        return <DocIcon sx={{ color: '#38bdf8' }} />;
      case 'event':
        return <EventIcon sx={{ color: '#fb923c' }} />;
      default:
        return <DraftsIcon />;
    }
  };

  // Helper for type chip colors
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

  const pageCount = Math.ceil(totalCount / limit);

  return (
    <Box>
      {/* Header and top-level filter controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" color="text.primary">
          Inbox
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<CheckIcon />}
              onClick={markPageAsRead}
              color="primary"
            >
              Mark Page as Read
            </Button>
          )}

          {/* Filter select */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-type-label">Type</InputLabel>
            <Select
              labelId="filter-type-label"
              value={typeFilter}
              label="Type"
              onChange={handleFilterChange}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>

          {/* Page size limit select */}
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel id="limit-label">Show</InputLabel>
            <Select
              labelId="limit-label"
              value={limit}
              label="Show"
              onChange={handleLimitChange}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
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

      {/* Grid List */}
      <Grid container spacing={2}>
        {loading ? (
          // Skeletons during load
          Array.from(new Array(limit)).map((_, index) => (
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
                No Notifications Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing your search filter parameters.
              </Typography>
            </Box>
          </Grid>
        ) : (
          // Card List
          notifications.map((n) => {
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
                    borderLeft: isRead ? '4px solid transparent' : '4px solid #6366f1',
                    backgroundColor: isRead ? 'rgba(30, 41, 59, 0.4)' : '#1e293b',
                    border: isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(99, 102, 241, 0.15)',
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
                          label={n.Type}
                          size="small"
                          sx={{
                            backgroundColor: chipColors.bg,
                            color: chipColors.text,
                            fontWeight: 600,
                            borderRadius: '6px',
                            '& .MuiChip-icon': { color: 'inherit' }
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
                      <Typography variant="caption" color="text.secondary">
                        {n.Timestamp}
                      </Typography>
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
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card onClick double trigger
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

      {/* Pagination control */}
      {pageCount > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
          />
        </Box>
      )}
    </Box>
  );
}
