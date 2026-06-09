import { getTopNotifications } from './services/notificationService.js';

async function main() {
  try {
    const top = await getTopNotifications(10);

    console.log('\nTop 10 Priority Notifications:');
    top.forEach((n, index) => {
      const formattedScore = typeof n.priorityScore === 'number' ? n.priorityScore.toFixed(2) : n.priorityScore;
      console.log(
        `${index + 1}. ID: ${n.ID} | Type: ${n.Type} | Message: ${n.Message} | Timestamp: ${n.Timestamp} | Priority Score: ${formattedScore}`
      );
    });
  } catch (err) {
    console.error('Failed to compute top notifications:', err);
    process.exitCode = 1;
  }
}

main();


