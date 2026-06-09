const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1,
};

function computeRecencyContribution(timestampMs) {
  const now = Date.now();
  const ageMs = Math.max(0, now - timestampMs);

  // Half-life of 1 day (tunable).
  const halfLifeMs = 24 * 60 * 60 * 1000;
  const lambda = Math.log(2) / halfLifeMs;

  return Math.exp(-lambda * ageMs);
}

function normalizeType(type) {
  return String(type || '').toLowerCase();
}

function calculatePriority(notification, options = {}) {
  const weightPlacement = options.placementWeight ?? TYPE_WEIGHTS.placement;
  const weightResult = options.resultWeight ?? TYPE_WEIGHTS.result;
  const weightEvent = options.eventWeight ?? TYPE_WEIGHTS.event;

  const type = normalizeType(
    notification.type ?? notification.notificationType,
  );

  const typeWeight =
    type === 'placement'
      ? weightPlacement
      : type === 'result'
        ? weightResult
        : type === 'event'
          ? weightEvent
          : 0;

  const tsRaw =
    notification.timestamp ??
    notification.createdAt ??
    notification.time ??
    notification.date;

  const timestampMs = typeof tsRaw === 'number' ? tsRaw : Date.parse(tsRaw);

  // If timestamp missing/invalid, treat as oldest.
  const recency = Number.isFinite(timestampMs) ? computeRecencyContribution(timestampMs) : 0;

  // Final score: type dominates; recency refines.
  const priorityScore = typeWeight * (0.5 + recency);

  return { type, typeWeight, recency, priorityScore };
}

export { calculatePriority };

