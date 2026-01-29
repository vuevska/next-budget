import axios from "axios";

export async function createAccount(name: string, amount: number) {
  try {
    const res = await axios.post("/api/account-types", { name, amount });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create account",
      );
    }
    throw new Error("Failed to create account");
  }
}

export async function updateAccount(id: number, name: string) {
  try {
    const res = await axios.patch(`/api/account-types/${id}`, { name });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update account",
      );
    }
    throw new Error("Failed to update account");
  }
}