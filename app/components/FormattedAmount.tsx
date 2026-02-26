"use client";

import { formatMKD } from "@/app/lib/formatMKD";

export default function FormattedAmount({
  amount,
}: Readonly<{ amount: number }>) {
  return (
      <span suppressHydrationWarning>
        {formatMKD(amount)}
      </span>
    );
}
