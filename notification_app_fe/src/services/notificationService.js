import { fetchNotifications } from '../api/notificationApi.js';
import { calculatePriority } from '../utils/priorityCalculator.js';
import { MinHeap } from '../utils/minHeap.js';
import { Log } from '../utils/logger.js';

/**
 * Returns the top notifications sorted by priority (highest first).
 * @param {number} limit Maximum number of notifications to return
 * @returns {Promise<Array>} List of prioritized notifications
 */
async function getTopNotifications(limit = 10) {
  const notifications = await fetchNotifications();

  // MinHeap compares notifications by priorityScore (min at top)
  const heap = new MinHeap((a, b) => a.priorityScore - b.priorityScore);

  for (const n of notifications) {
    const priorityScore = calculatePriority(n);
    const entry = { ...n, priorityScore };

    if (heap.size() < limit) {
      heap.insert(entry);
    } else {
      const min = heap.peek();
      if (min && priorityScore > min.priorityScore) {
        heap.extractMin();
        heap.insert(entry);
      }
    }
  }

  const top = [];
  while (heap.size() > 0) {
    top.push(heap.extractMin());
  }

  // Sort descending (highest priority score first)
  top.sort((a, b) => b.priorityScore - a.priorityScore);

  Log('info', 'service', 'Top notifications computed');
  
  return top;
}

export { getTopNotifications };


