const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1,
};

/**
 * Calculates priority score for a notification.
 * @param {Object} notification 
 * @returns {number} priorityScore
 */
export function calculatePriority(notification) {
  const type = String(notification.Type || '').toLowerCase();
  const typeWeight = TYPE_WEIGHTS[type] || 0;

  const timestampStr = notification.Timestamp || '';
  const normalizedStr = timestampStr.includes(' ') ? timestampStr.replace(' ', 'T') : timestampStr;
  const timestamp = Date.parse(normalizedStr);

  const recencyScore = Number.isNaN(timestamp) ? 0 : timestamp / 1e12;
  return typeWeight + recencyScore;
}
