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

export async function createSubCategory(categoryId: number, name: string) {
  try {
    const res = await axios.post("/api/subcategories", {
      categoryId,
      name,
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to create subcategory",
      );
    }
    throw new Error("Failed to create subcategory");
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

export async function getSubCategories() {
  try {
    const res = await axios.get("/api/subcategories");
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch subcategories",
      );
    }
    throw new Error("Failed to fetch subcategories");
  }
}

export async function getToBeBudgeted() {
  try {
    const res = await axios.get("/api/transactions/to-be-budgeted");
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch to-be-budgeted amount",
      );
    }
    throw new Error("Failed to fetch to-be-budgeted amount");
  }
}

export async function allocateBudget(amount: number, subCategoryId: number) {
  try {
    const res = await axios.post("/api/budget/allocate", {
      amount,
      subCategoryId,
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
