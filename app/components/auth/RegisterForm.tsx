"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/app/lib/validationSchema";
import { z } from "zod";
import ErrorMessage from "../ErrorMessage";
import { Button } from "@radix-ui/themes";
import { registerUser } from "@/app/lib/services/user";

type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
  onRegisterSuccess: () => void;
}

export default function RegisterForm({ onRegisterSuccess }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      await registerUser(values);
      onRegisterSuccess();
      router.push("/auth/signin?message=Registration successful. Please sign in.");
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {serverError}
        </div>
      )}
      

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register("email")}
          type="email"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`}
        />
        <ErrorMessage>{errors.email?.message}</ErrorMessage>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          {...register("password")}
          type="password"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`}
        />
      <ErrorMessage>{errors.password?.message}</ErrorMessage>

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          {...register("confirmPassword")}
          type="password"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`}
        />
        <ErrorMessage>{errors.confirmPassword?.message}</ErrorMessage>

      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}