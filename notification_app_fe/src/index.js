import { getTopNotifications } from './services/notificationService.js';

async function main() {
  const top = await getTopNotifications(10);

  console.log('Top 10 Priority Notifications');
  for (const n of top) {
    console.log({
      id: n.id ?? n.notificationId ?? n._id,
      title: n.title ?? n.subject ?? n.name,
      type: n.type ?? n.notificationType,
      timestamp: n.timestamp ?? n.createdAt ?? n.time ?? n.date,
      priorityScore: n.priorityScore,
    });
  }
}

main().catch((err) => {
  console.error('Failed to compute top notifications:', err);
  process.exitCode = 1;
});

