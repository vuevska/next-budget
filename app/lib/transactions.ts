import { AccountType } from "@prisma/client";
import axios from "axios";

export async function getTransactions(account: AccountType) {
  try {
    const res = await axios.get(
      `/api/transactions?accountTypeId=${account.id}`,
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch transactions for account",
      );
    }
    throw new Error("Failed to fetch transactions for account");
  }
}

export async function deleteTransaction(id: number) {
  try {
    const res = await axios.delete(`/api/transactions/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Failed to delete transaction");
  }
}
