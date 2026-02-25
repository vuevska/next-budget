"use client";

import { Suspense, useState } from "react";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";
import EmailSignInForm from "@/app/components/auth/EmailSignInForm";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Next Budget
            </h1>
            <p className="text-slate-600">Manage your finances with ease</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors ${
                activeTab === "signin"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors ${
                activeTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "signin" ? (
              <>
                <div className="space-y-4">
                  <Suspense fallback={<div>Loading...</div>}>
                    <EmailSignInForm />
                  </Suspense>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <GoogleSignInButton />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <RegisterForm onRegisterSuccess={() => setActiveTab("signin")} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or register with
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <GoogleSignInButton />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>By signing in, you agree to our Terms of Service</p>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Secure authentication powered by NextAuth.js</p>
        </div>
      </div>
    </div>
  );
}
