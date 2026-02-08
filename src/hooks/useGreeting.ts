export function useGreeting() {
  const now = new Date();

  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const tips = [
    'You have 3 meetings today — your first is at 2:00 PM',
    'Consider blocking focus time this afternoon',
    'Your busiest day this week is Wednesday',
  ];
  const tip = tips[now.getDay() % tips.length];

  return { greeting, dayName, monthDay, tip };
}
