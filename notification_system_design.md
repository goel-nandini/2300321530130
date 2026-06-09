# Notification Priority System Design

---

## Stage 1

### Problem Statement
Build a high-performance notification processing backend that fetches notifications from a remote protected API and retrieves the top 10 unread notifications based on priority.

Constraints:
- No user interface (CLI only)
- No local or remote database
- No hardcoded notification data
- O(N) heap-based filtering algorithm (no full array sort)
- Structured logging throughout using the `Log()` middleware

### Priority Strategy
Each notification type is assigned a weight:
| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

Priority score formula:
```
priorityScore = typeWeight + recencyScore
recencyScore  = timestamp_ms / 1e12
```

### Recency Handling
- Normalize the Unix timestamp (ms) by dividing by `1e12`.
- More recent notifications produce larger recency scores, naturally ranking higher within the same type.

### Algorithm
Uses a **Min-Heap of fixed size K = 10**:
1. Fetch all N notifications from the API.
2. For each notification, calculate `priorityScore`.
3. If heap size < 10 → insert directly.
4. If heap size = 10 → compare with heap minimum:
   - If current score > minimum → `extractMin()` + `insert()`.
   - Otherwise → discard.
5. Drain heap, sort descending, print top 10.

### Time Complexity
| Operation        | Complexity          |
|------------------|---------------------|
| API Fetch        | O(N)                |
| Heap per item    | O(log 10) ≈ O(1)   |
| Full iteration   | O(N log 10) = O(N) |
| Final drain/sort | O(10 log 10) = O(1)|
| **Overall**      | **O(N)**            |

### Scalability
- Memory bounded at O(10) regardless of N.
- Scales to millions of notifications without degradation.

### Logging Strategy
```javascript
function Log(level, module, message) {
  console.log(`[${level.toUpperCase()}] [${module}] ${message}`);
}
```
- `[INFO] [api]` — on every API fetch attempt
- `[INFO] [utils]` — per notification priority calculation
- `[INFO] [service]` — when top list is computed
- `[ERROR] [api]` — on fetch or HTTP failure

---

## Stage 2

### Problem Statement
Build a responsive React frontend application that:
- Displays all notifications with pagination and type filtering.
- Shows a Priority Board with Top N notifications computed client-side via MinHeap.
- Distinguishes read vs. unread notifications using `localStorage` persistence.
- Runs on `http://localhost:3000`.
- Uses Material UI exclusively for styling.

### Frontend Architecture

```
notification_app_fe/
├── src/
│   ├── api.js                          # API client + Mock fallback engine
│   ├── App.jsx                         # Root layout: theme, sidebar, routing
│   ├── index.css                       # Global styles, fonts, animations
│   ├── main.jsx                        # React DOM entry point
│   ├── components/
│   │   ├── AllNotifications.jsx        # Inbox view: pagination, filters
│   │   ├── PriorityNotifications.jsx   # Priority Board: MinHeap selection
│   │   └── NotificationCard.jsx        # Shared card component
│   └── utils/
│       ├── minHeap.js                  # Client-side MinHeap data structure
│       └── priorityCalculator.js       # Priority score formula
```

### Pages

#### Inbox (All Notifications)
- Fetches notifications via API with query params: `limit`, `page`, `notification_type`.
- Provides Type filter (All / Placement / Result / Event) and per-page limit (5 / 10 / 20).
- MUI Pagination component for multi-page navigation.
- Loading state: animated MUI Skeleton cards.
- Read/unread state: indigo left-border accent + "New" badge on unread cards.
- "Mark Page Read" button to bulk-mark all visible cards.

#### Priority Board (Priority Notifications)
- Fetches a batch of 100 notifications and applies client-side MinHeap to select the Top N.
- Adjustable N via dropdown (Top 5 / 10 / 15 / 20).
- Each card displays: type chip, rank badge (`#1`, `#2`, …), priority score chip, read state.
- Amber left-border accent distinguishes it from Inbox.
- "Mark All Read" button for the full displayed board.

### Read/Unread Tracking
- Notification IDs are stored in `localStorage` under the key `viewed_notification_ids`.
- State is initialized from `localStorage` on app mount and shared via React props between both pages.
- Visual cues for unread: bold text, indigo/amber left border, "New" Chip badge.
- Visual cues for read: dimmed text, transparent border, ✓ Read label.
- Live unread count displayed in the sidebar badge and the AppBar bell icon.

### API Client (`api.js`)
- Supports query params: `limit`, `page`, `notification_type`.
- Falls back to a client-side **Mock Engine** if the token is a placeholder or the API returns 401.
- The Mock Engine applies the same filtering, sorting (by timestamp desc), and pagination as the real API would.

### Styling Strategy
- **Material UI v9** exclusively for all components — no ShadCN, Tailwind, or custom CSS frameworks.
- Custom dark theme: Slate-900 background (`#0f172a`), Slate-800 surfaces (`#1e293b`), Indigo primary (`#6366f1`), Amber secondary (`#f59e0b`).
- **Outfit** Google Font for all typography.
- Smooth `translateY` hover animations on cards.
- CSS `@keyframes fadeInUp` / `slideIn` for page and card entry transitions.
- Custom slim scrollbar via `::-webkit-scrollbar`.

### Responsiveness
- Sidebar is a permanent `Drawer` on `md+` (≥ 900px) breakpoint.
- On mobile (`xs`/`sm`), the sidebar collapses into a temporary drawer opened via a hamburger `MenuIcon` in the AppBar.
- Filter controls stack vertically on small screens using MUI `Stack` responsive `direction` props.
- All grid/card layouts use full width on mobile.

### Complexity (Priority Board)
| Operation       | Complexity          |
|-----------------|---------------------|
| API Fetch       | O(N)                |
| Heap per item   | O(log K) ≈ O(1)    |
| Full processing | O(N log K)          |
| **Overall**     | **O(N)**            |

Where K = topN (max 20), log K is effectively constant.
