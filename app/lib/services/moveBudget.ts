import axios from "axios";

export async function moveBudgetedAmount(
  amount: number,
  fromSubCategoryId: number,
  toSubCategoryId: number,
) {
  try {
    const res = await axios.post("/api/budget/move", {
      amount,
      fromSubCategoryId,
      toSubCategoryId,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to move budgeted amount",
      );
    }
    throw new Error("Failed to move budgeted amount");
  }
}
