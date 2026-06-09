import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import {
  Work as WorkIcon,
  Description as DocIcon,
  EventNote as EventIcon,
  Drafts as DraftsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const TYPE_CONFIG = {
  placement: { bg: 'rgba(129,140,248,0.15)', text: '#818cf8', icon: <WorkIcon sx={{ color: '#818cf8' }} /> },
  result:    { bg: 'rgba(56,189,248,0.15)',  text: '#38bdf8', icon: <DocIcon  sx={{ color: '#38bdf8' }} /> },
  event:     { bg: 'rgba(251,146,60,0.15)',  text: '#fb923c', icon: <EventIcon sx={{ color: '#fb923c' }} /> },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[String(type || '').toLowerCase()] ?? {
    bg: 'rgba(255,255,255,0.08)', text: '#94a3b8',
    icon: <DraftsIcon sx={{ color: '#94a3b8' }} />,
  };

/**
 * Shared notification card component.
 * @param {Object}   props
 * @param {Object}   props.notification   - Notification data object
 * @param {boolean}  props.isRead         - Whether this notification is read
 * @param {Function} props.onMarkRead     - Called when user clicks mark-as-read
 * @param {number}   [props.rank]         - Optional rank badge (Priority Board)
 * @param {number}   [props.score]        - Optional priority score to display
 * @param {string}   [props.accentColor]  - Left-border accent hex (default indigo)
 */
export default function NotificationCard({
  notification: n,
  isRead,
  onMarkRead,
  rank,
  score,
  accentColor = '#6366f1',
}) {
  const cfg = getTypeConfig(n.Type);

  return (
    <Card
      onClick={() => onMarkRead(n.ID)}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
        borderLeft: isRead ? '4px solid transparent' : `4px solid ${accentColor}`,
        backgroundColor: isRead ? 'rgba(30,41,59,0.35)' : '#1e293b',
        border: isRead
          ? '1px solid rgba(255,255,255,0.05)'
          : `1px solid ${accentColor}26`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          backgroundColor: isRead ? 'rgba(30,41,59,0.55)' : 'rgba(30,41,59,0.95)',
        },
      }}
    >
      <CardContent sx={{ pb: '10px !important' }}>
        {/* ── Row 1: chips + timestamp ── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1.25 }}
        >
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {/* Type chip */}
            <Chip
              icon={cfg.icon}
              label={n.Type}
              size="small"
              sx={{
                bgcolor: cfg.bg,
                color: cfg.text,
                fontWeight: 600,
                borderRadius: '6px',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />

            {/* Rank chip (Priority Board) */}
            {rank != null && (
              <Chip
                label={`#${rank}`}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, borderRadius: '5px' }}
              />
            )}

            {/* "New" badge */}
            {!isRead && (
              <Chip
                label="New"
                size="small"
                color="primary"
                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, borderRadius: '5px' }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Priority score chip */}
            {score != null && (
              <Chip
                label={`Score ${Number(score).toFixed(2)}`}
                size="small"
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  color: 'text.secondary',
                }}
              />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {n.Timestamp}
            </Typography>
          </Stack>
        </Stack>

        {/* ── Row 2: Message ── */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: isRead ? 400 : 600,
            color: isRead ? 'text.secondary' : 'text.primary',
            lineHeight: 1.45,
            transition: 'color 0.2s ease',
          }}
        >
          {n.Message}
        </Typography>
      </CardContent>

      {/* ── Footer ── */}
      <CardActions sx={{ px: 2, pb: 1.75, pt: 0, justifyContent: 'flex-end' }}>
        {!isRead ? (
          <Button
            size="small"
            sx={{ fontWeight: 600 }}
            onClick={(e) => { e.stopPropagation(); onMarkRead(n.ID); }}
          >
            Mark as Read
          </Button>
        ) : (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}
          >
            <CheckIcon fontSize="inherit" /> Read
          </Typography>
        )}
      </CardActions>
    </Card>
  );
}
