export function formatCalories(kcal?: number | null): string {
  if (kcal === undefined || kcal === null || isNaN(kcal)) return '0 kcal';
  return `${Math.round(kcal)} kcal`;
}

export function formatMacro(grams?: number | null): string {
  if (grams === undefined || grams === null || isNaN(grams)) return '0g';
  return `${Math.round(grams)}g`;
}

export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateISO(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeGreeting(name: string = 'Friend'): string {
  const hour = new Date().getHours();
  let timeStr = 'day';
  if (hour >= 5 && hour < 12) timeStr = 'morning';
  else if (hour >= 12 && hour < 17) timeStr = 'afternoon';
  else if (hour >= 17 && hour < 22) timeStr = 'evening';
  else timeStr = 'night';

  const cleanName = name.trim().split(' ')[0] || 'Friend';
  return `Good ${timeStr}, ${cleanName}!`;
}
