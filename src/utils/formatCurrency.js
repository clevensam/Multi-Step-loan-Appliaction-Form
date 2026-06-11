export function formatIndian(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const num = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompact(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return formatIndian(num);
}

export function formatIndianNumber(num) {
  if (num == null || Number.isNaN(Number(num))) return '—';
  const n = Math.round(Number(num)).toString();
  const lastThree = n.slice(-3);
  const rest = n.slice(0, -3);
  const formatted = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
  return `₹${formatted}`;
}
