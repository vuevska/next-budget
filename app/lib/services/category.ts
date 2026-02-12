import axios from "axios";

export async function createCategory(name: string) {
  try {
    const res = await axios.post("/api/categories", { name });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to create category",
      );
    }
    throw new Error("Failed to create category");
  }
}

export async function persistCategoryOrder(categories: { id: number }[]) {
  try {
    const res = await axios.post("/api/categories/order", { categories });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to persist category order",
      );
    }
    throw new Error("Failed to persist category order");
  }
}