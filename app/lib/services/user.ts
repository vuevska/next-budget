import z from "zod";
import { registerSchema } from "../validationSchema";
import axios from "axios";

type RegisterFormData = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterFormData) {
  try {
    const res = await axios.post("/api/auth/register", data);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Registration failed"
      );
    }
    throw new Error("An unexpected error occurred during registration");
  }
}