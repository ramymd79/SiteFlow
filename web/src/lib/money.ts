export function piasters(egp: number): number {
  return Math.round(egp * 100);
}

export function formatMoney(valuePiasters: number): string {
  const sign = valuePiasters < 0 ? "-" : "";
  const abs = Math.abs(valuePiasters);
  const egp = abs / 100;
  const formatted = new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(egp);
  return `${sign}${formatted} جنيه`;
}

export function parseEgp(input: string): number {
  const n = Number(String(input).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return piasters(n);
}
