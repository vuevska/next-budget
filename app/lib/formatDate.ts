export function formatDate(inputDate: Date | string): string {
  const d = new Date(inputDate);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
