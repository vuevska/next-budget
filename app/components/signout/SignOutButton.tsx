"use client";

import { Button } from "@radix-ui/themes";
import { signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

const SignOutButton = () => {
  return (
    <Button
      onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors duration-200 text-white rounded-lg text-sm font-medium"
    >
      <FiLogOut size={16} />
      <span>Log out</span>
    </Button>
  );
};

export default SignOutButton;
