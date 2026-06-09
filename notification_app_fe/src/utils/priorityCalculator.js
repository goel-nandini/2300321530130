import { Log } from './logger.js';

const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1,
};

/**
 * Calculates the priority score of a notification.
 * @param {Object} notification
 * @returns {number} The priority score
 */
function calculatePriority(notification) {
  const type = String(notification.Type || '').toLowerCase();
  const typeWeight = TYPE_WEIGHTS[type] || 0;

  const timestampStr = notification.Timestamp || '';
  // Normalize date string formatting by replacing space with 'T' to ensure cross-platform/node compatibility
  const normalizedStr = timestampStr.includes(' ') ? timestampStr.replace(' ', 'T') : timestampStr;
  const timestamp = Date.parse(normalizedStr);

  const recencyScore = Number.isNaN(timestamp) ? 0 : timestamp / 1e12;
  const priorityScore = typeWeight + recencyScore;

  Log('info', 'utils', `Priority score calculated for notification ID: ${notification.ID}`);

  return priorityScore;
}

export { calculatePriority };


