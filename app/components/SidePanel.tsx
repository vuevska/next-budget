"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "@radix-ui/themes";

export default function SidePanel() {
  const currentPath = usePathname();
  const { status, data: session } = useSession();

  return (
    <aside className="w-64 min-h-screen bg-slate-800">
      <div className="m-2 p-5 text-white">Side Panel</div>
      <Box>
        {status === "authenticated" && (
          <Link href="/api/auth/signout">Log out</Link>
        )}
        {status === "unauthenticated" && (
          <Link href="/api/auth/signin">Login</Link>
        )}
      </Box>
    </aside>
  );
}
