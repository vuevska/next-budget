import axios from "axios";

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
