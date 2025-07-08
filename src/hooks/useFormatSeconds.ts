export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [
    hours > 0 ? `${hours}H` : null,
    minutes > 0 ? `${minutes}M` : null,
    `${seconds}S`
  ];

  return parts.filter(Boolean).join(" ");
}