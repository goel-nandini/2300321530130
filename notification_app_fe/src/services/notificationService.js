import { fetchNotifications } from '../api/notificationApi.js';
import { calculatePriority } from '../utils/priorityCalculator.js';
import { MinHeap } from '../utils/minHeap.js';

function getLogger() {
  // Prefer existing repo logger (logging middleware).
  // If it fails (module format/env), fall back to console.
  try {
    // logging middleware/index.js is ESM.
    // Dynamic import would be async; instead we just fall back on failure.
    // For Stage 1 correctness, console fallback is acceptable.
    // eslint-disable-next-line no-undef
    if (typeof console !== 'undefined') {
      return {
        log: async (level, pkg, message) => {
          const fn = level === 'error' ? console.error : console.log;
          fn(`[${level}] ${pkg}: ${message}`);
        },
      };
    }
  } catch {
    // ignore
  }

  return {
    log: async (level, pkg, message) => {
      const fn = level === 'error' ? console.error : console.log;
      fn(`[${level}] ${pkg}: ${message}`);
    },
  };
}

function isUnread(notification) {
  const status = notification.readStatus ?? notification.status;
  if (typeof status === 'string') return status.toLowerCase() !== 'read';

  const unreadFlag = notification.unread ?? notification.isUnread;
  if (typeof unreadFlag === 'boolean') return unreadFlag;

  if (typeof notification.read === 'boolean') return !notification.read;
  if (notification.readAt != null) return false;

  return true;
}

async function getTopNotifications(limit = 10, { heapLimit = 10 } = {}) {
  const logger = getLogger();

  await logger.log('info', 'service', 'Fetching notifications');
  const notifications = await fetchNotifications();

  const heap = new MinHeap((a, b) => a.priorityScore - b.priorityScore);

  for (const n of notifications) {
    if (!isUnread(n)) continue;

    const { priorityScore } = calculatePriority(n);
    const entry = { ...n, priorityScore };

    if (heap.size() < heapLimit) {
      heap.insert(entry);
      continue;
    }

    const min = heap.peek();
    if (min && priorityScore > min.priorityScore) {
      heap.extractMin();
      heap.insert(entry);
    }
  }

  const top = [];
  while (heap.size() > 0) top.push(heap.extractMin());
  top.sort((a, b) => b.priorityScore - a.priorityScore);

  await logger.log('info', 'service', 'Top notifications computed');
  return top.slice(0, limit);
}

export { getTopNotifications };

