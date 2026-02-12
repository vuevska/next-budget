import { Transaction, SubCategory } from "@prisma/client";

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  payee: string;
  description: string;
  category: string;
  amountMin: string;
  amountMax: string;
  type: string;
}

type TransactionWithSubCategory = Transaction & {
  subCategory: SubCategory | null;
};

export const matchesDateRange = (
  transactionDate: Date,
  filters: FilterState,
): boolean => {
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom);
    if (new Date(transactionDate) < dateFrom) return false;
  }
  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    dateTo.setHours(23, 59, 59, 999);
    if (new Date(transactionDate) > dateTo) return false;
  }
  return true;
};

export const matchesPayee = (payee: string, filters: FilterState): boolean => {
  if (!filters.payee) return true;
  return payee.toLowerCase().includes(filters.payee.toLowerCase());
};

export const matchesDescription = (
  description: string,
  filters: FilterState,
): boolean => {
  if (!filters.description) return true;
  return description.toLowerCase().includes(filters.description.toLowerCase());
};

export const matchesCategory = (
  transaction: TransactionWithSubCategory,
  filters: FilterState,
): boolean => {
  if (!filters.category) return true;
  const categoryName = transaction.subCategory
    ? transaction.subCategory.name
    : "To be Budgeted";
  return categoryName === filters.category;
};

export const matchesAmountRange = (
  amount: number,
  filters: FilterState,
): boolean => {
  if (filters.amountMin) {
    const minAmount = Number.parseFloat(filters.amountMin);
    if (!Number.isNaN(minAmount) && amount < minAmount) return false;
  }
  if (filters.amountMax) {
    const maxAmount = Number.parseFloat(filters.amountMax);
    if (!Number.isNaN(maxAmount) && amount > maxAmount) return false;
  }
  return true;
};

export const matchesType = (
  isInflow: boolean,
  filters: FilterState,
): boolean => {
  if (!filters.type) return true;
  return filters.type === "inflow" ? isInflow : !isInflow;
};

export const filterTransactions = (
  transactions: TransactionWithSubCategory[],
  filters: FilterState,
): TransactionWithSubCategory[] => {
  return transactions.filter((transaction) => {
    return (
      matchesDateRange(transaction.date, filters) &&
      matchesPayee(transaction.payee, filters) &&
      matchesDescription(transaction.description, filters) &&
      matchesCategory(transaction, filters) &&
      matchesAmountRange(transaction.amount, filters) &&
      matchesType(transaction.isInflow, filters)
    );
  });
};

export const getInitialFilterState = (): FilterState => ({
  dateFrom: "",
  dateTo: "",
  payee: "",
  description: "",
  category: "",
  amountMin: "",
  amountMax: "",
  type: "",
});
