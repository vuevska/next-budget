import { useState } from "react";
import { FilterState, getInitialFilterState } from "./transactionFilters";

export const useTransactionFilters = () => {
  const [filters, setFilters] = useState<FilterState>(getInitialFilterState());

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(getInitialFilterState());
  };

  return { filters, handleFilterChange, clearFilters };
};
