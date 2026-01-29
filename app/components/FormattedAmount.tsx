"use client";

import { formatMKD } from "@/app/lib/formatMKD";

export default function FormattedAmount({
  amount,
}: Readonly<{ amount: number }>) {
  return <>{formatMKD(amount)}</>;
}
