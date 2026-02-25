"use client";

import { Button } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

const GoogleSignInButton = () => {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium text-slate-800"
    >
      <FcGoogle size={24} />
      <span>Sign in with Google</span>
    </Button>
  );
};

export default GoogleSignInButton;
