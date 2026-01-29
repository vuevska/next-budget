export function formatMKD(amount: number | string): string {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("mk-MK", {
    style: "currency",
    currency: "MKD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberAmount);
}
