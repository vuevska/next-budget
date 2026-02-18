import axios from "axios";

export async function allocateBudget(
  amount: number,
  subCategoryId: number,
  month?: number,
  year?: number,
) {
  try {
    const res = await axios.post("/api/budget/allocate", {
      amount,
      subCategoryId,
      month,
      year,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to allocate budget",
      );
    }
    throw new Error("Failed to allocate budget");
  }
}

export async function moveBudgetedAmount(
  amount: number,
  fromSubCategoryId: number,
  toSubCategoryId: number,
  month?: number,
  year?: number,
) {
  try {
    const res = await axios.post("/api/budget/move", {
      amount,
      fromSubCategoryId,
      toSubCategoryId,
      month,
      year,
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

export async function getBudgetPeriodSnapshot(month: number, year: number) {
  try {
    const res = await axios.get("/api/budget/period", {
      params: { month, year },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch budget period snapshot",
      );
    }
    throw new Error("Failed to fetch budget period snapshot");
  }
}
