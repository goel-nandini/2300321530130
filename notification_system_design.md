# Stage 1

## Problem Statement
The objective of this stage is to build a high-performance notification processing backend that fetches notifications from a remote protected API and retrieves the top 10 unread notifications based on priority. The system must operate within the following constraints:
- No user interface (CLI only)
- No local or remote database
- No hardcoded notification data
- Must use an O(N) heap-based filtering algorithm to select the top 10 notifications without sorting the entire dataset
- Log every important system event using a standardized logging pattern

## Priority Strategy
Notifications are assigned a numerical priority score computed from their type and their recency.
Each notification type has a pre-defined weight:
- **Placement**: Weight = 3
- **Result**: Weight = 2
- **Event**: Weight = 1
- **Other types**: Default weight = 0

The priority score formula is:
$$\text{priorityScore} = \text{typeWeight} + \text{recencyScore}$$

## Recency Handling
To ensure newer notifications are prioritized over older ones within the same type category, we calculate and add a normalized recency score.
1. The notification's `Timestamp` (e.g. `"2026-04-22 17:51:18"`) is converted into a standard Unix epoch millisecond timestamp.
2. The timestamp is normalized by dividing by $10^{12}$ ($1\text{e}12$):
   $$\text{recencyScore} = \frac{\text{timestampMs}}{10^{12}}$$
3. Because Unix timestamps grow as time progresses, a larger (more recent) timestamp results in a larger `recencyScore`, thus increasing the overall priority score.

## Algorithm
Instead of sorting the entire array of notifications—which is inefficient for large datasets—the system maintains a min-heap of a fixed maximum size of 10.
1. Fetch the raw notifications list from the protected API.
2. Initialize an empty `MinHeap` where comparisons are based on `priorityScore`.
3. For each notification:
   - Calculate its `priorityScore` using `calculatePriority(notification)`.
   - If the heap contains fewer than 10 elements, insert the notification directly: $O(\log 10) = O(1)$.
   - If the heap already has 10 elements, compare the notification's `priorityScore` with the minimum score in the heap (the root element):
     - If the current notification's score is strictly higher than the root element, extract the root (minimum) element and insert the current notification.
     - Otherwise, discard the current notification.
4. After processing all $N$ notifications, extract all remaining notifications from the heap (up to 10 elements).
5. Sort the extracted notifications in descending order (highest priority first) and print them to the console in the required format.

## Time Complexity
- **Fetching**: $O(N)$ where $N$ is the number of notifications returned by the API.
- **Heap Insertion/Extraction**: Each insertion or extraction on a heap of max size $K = 10$ takes $O(\log K) = O(\log 10) \approx 3.32$ operations, which is $O(1)$ constant time.
- **Processing Loop**: For $N$ notifications, the loop does at most 1 heap peek and 1 heap insert/extract min, leading to a complexity of $O(N \log K) = O(N \log 10)$.
- **Final Sorting**: Sorting the final list of size $K$ takes $O(K \log K) = O(10 \log 10) = O(1)$ constant time.
- **Overall Time Complexity**: $O(N)$ linear time. This is extremely efficient and scales linearly with the input size.

## Scalability
The min-heap approach ensures excellent scalability:
- **Memory Efficiency**: The memory footprint remains bounded at $O(K) = O(10)$ elements, regardless of whether we process $100$ or $10,000,000$ notifications.
- **CPU Efficiency**: By keeping the heap size bounded to $K$, we avoid sorting the entire array ($O(N \log N)$), saving substantial CPU time and processing resources for large values of $N$.

## Logging Strategy
All components implement structured logging to stdout. The logger function is defined as:
```javascript
function Log(level, module, message) {
  console.log(`[${level.toUpperCase()}] [${module}] ${message}`);
}
```
Logging statements are positioned throughout the application lifecycle:
- **API module**: Logs when initiating a fetch request and any errors caught during the fetch operation.
- **Priority calculator**: Logs for every notification priority calculation, referencing the notification ID.
- **Notification service**: Logs once the top notifications calculation completes.
