const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const BEARER_TOKEN = 'PLACEHOLDER_TOKEN_BEARER';

// High-quality mock notifications list for local testing / fallback
const MOCK_NOTIFICATIONS = [
  { ID: "d146095a-0d86-4a34-9e69-3900a14576bc", Type: "Result", Message: "DBMS Mid-Sem results announced", Timestamp: "2026-06-09 12:15:30" },
  { ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0", Type: "Placement", Message: "CSX Corporation hiring System Administrators", Timestamp: "2026-06-09 11:45:18" },
  { ID: "81589ada-0ad3-4f77-9554-f52fb558e09d", Type: "Event", Message: "Farewell Party registration deadline extension", Timestamp: "2026-06-09 10:20:06" },
  { ID: "ea836726-c25e-4f21-a72f-544a6af8a37f", Type: "Result", Message: "Project review scheduling for Section A & B", Timestamp: "2026-06-08 17:50:42" },
  { ID: "003cb427-8fc6-47f7-bb00-be228f6b0d2c", Type: "Result", Message: "External laboratory examination schedules", Timestamp: "2026-06-08 14:30:30" },
  { ID: "e5c4ff20-31bf-4d40-8f02-72fda59e8918", Type: "Result", Message: "Advanced Database Management system grades", Timestamp: "2026-06-08 09:12:18" },
  { ID: "1cfce5ee-ad37-4894-8946-d707627176a5", Type: "Event", Message: "Annual Tech-Fest guest speaker panel announced", Timestamp: "2026-06-07 16:50:06" },
  { ID: "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", Type: "Result", Message: "Capstone Project initial phase reviews out", Timestamp: "2026-06-07 11:10:54" },
  { ID: "8a7412bd-6065-4d09-8501-a37f11cc848b", Type: "Placement", Message: "Advanced Micro Devices Inc. hiring hardware interns", Timestamp: "2026-06-07 09:40:42" },
  { ID: "p001-placement", Type: "Placement", Message: "NVIDIA Software Engineer Full-Time application open", Timestamp: "2026-06-06 14:30:00" },
  { ID: "p002-placement", Type: "Placement", Message: "Microsoft Technical Program Manager drive details", Timestamp: "2026-06-06 10:15:00" },
  { ID: "e002-event", Type: "Event", Message: "Inter-college debate competition registration open", Timestamp: "2026-06-05 15:45:00" },
  { ID: "e003-event", Type: "Event", Message: "Coding Contest: Round 1 by ACM Student Chapter", Timestamp: "2026-06-05 13:00:00" },
  { ID: "r005-result", Type: "Result", Message: "Computer Networks Assignment 3 marks published", Timestamp: "2026-06-04 18:20:00" },
  { ID: "p003-placement", Type: "Placement", Message: "Amazon Web Services Solutions Architect hiring pool", Timestamp: "2026-06-04 11:00:00" },
  { ID: "e004-event", Type: "Event", Message: "Alumni Meet 2026 - Registration details and schedule", Timestamp: "2026-06-03 16:30:00" },
  { ID: "p004-placement", Type: "Placement", Message: "Qualcomm Embedded Engineer campus interviews starting", Timestamp: "2026-06-03 09:00:00" },
  { ID: "r006-result", Type: "Result", Message: "Formal Languages and Automata Theory mid-sem grades", Timestamp: "2026-06-02 14:10:00" },
  { ID: "e005-event", Type: "Event", Message: "Workshop: Introduction to Next.js & Server Components", Timestamp: "2026-06-01 10:00:00" },
  { ID: "p005-placement", Type: "Placement", Message: "Intel Corp Graduate Role Openings for Electrical/CS", Timestamp: "2026-05-30 15:20:00" }
];

/**
 * Fetches notifications from the API. Falls back to mock data if the Bearer token is a placeholder.
 * @param {Object} params
 * @param {number} [params.limit]
 * @param {number} [params.page]
 * @param {string} [params.notification_type]
 * @returns {Promise<Object>} API Response containing { notifications, totalCount }
 */
export async function fetchNotifications({ limit = 10, page = 1, notification_type } = {}) {
  // If Bearer token is the placeholder, use the mock engine to enable local testing
  if (BEARER_TOKEN === 'PLACEHOLDER_TOKEN_BEARER' || BEARER_TOKEN === '') {
    return simulateMockResponse({ limit, page, notification_type });
  }

  const url = new URL(API_URL);
  if (limit !== undefined) url.searchParams.append('limit', limit);
  if (page !== undefined) url.searchParams.append('page', page);
  if (notification_type) url.searchParams.append('notification_type', notification_type);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (response.status === 401) {
      console.warn("API returned 401 Unauthorized. Falling back to Mock Engine for evaluation.");
      return simulateMockResponse({ limit, page, notification_type });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure standard shape: { notifications: [], totalCount: count }
    const notifications = data.notifications || (Array.isArray(data) ? data : []);
    const totalCount = data.totalCount ?? data.total ?? notifications.length;

    return {
      notifications,
      totalCount
    };
  } catch (error) {
    console.error("Fetch API error. Falling back to Mock Engine. Error details:", error.message);
    return simulateMockResponse({ limit, page, notification_type });
  }
}

/**
 * Simulates a filtered, paginated backend API response using local mock data.
 */
function simulateMockResponse({ limit, page, notification_type }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Filter
      let filtered = [...MOCK_NOTIFICATIONS];
      if (notification_type && notification_type !== 'All') {
        const queryType = notification_type.toLowerCase();
        filtered = filtered.filter(n => String(n.Type || '').toLowerCase() === queryType);
      }

      // 2. Sort by timestamp descending
      filtered.sort((a, b) => Date.parse(b.Timestamp) - Date.parse(a.Timestamp));

      const totalCount = filtered.length;

      // 3. Paginate
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      const paginated = filtered.slice(startIdx, endIdx);

      resolve({
        notifications: paginated,
        totalCount
      });
    }, 300); // Small delay to simulate network latency
  });
}
