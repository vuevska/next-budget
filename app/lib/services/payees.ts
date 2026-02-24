import axios from "axios";

export async function getPayees() {
  try {
    const res = await axios.get("/api/payees");
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch payees",
      );
    }
    throw new Error("Failed to fetch payees");
  }
}

export async function createPayee(name: string) {
  try {
    const res = await axios.post("/api/payees", { name });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to create payee",
      );
    }
    throw new Error("Failed to create payee");
  }
}

export async function getTransferPayees(accountTypeId: number) {
  try {
    const res = await axios.get(`/api/payees/transfer?accountTypeId=${accountTypeId}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch transfer payees",
      );
    }
    throw new Error("Failed to fetch transfer payees");
  }
}
