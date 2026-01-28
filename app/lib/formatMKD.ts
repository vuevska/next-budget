import { useState, useEffect } from "react";

export function formatMKD(amount: number | string) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    if (amount === null || amount === undefined || amount === "") {
      setFormatted("");
      return;
    }
    const numberAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    const formattedValue = new Intl.NumberFormat("mk-MK", {
      style: "currency",
      currency: "MKD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberAmount);

    setFormatted(formattedValue);
  }, [amount]);

  return formatted;
}
