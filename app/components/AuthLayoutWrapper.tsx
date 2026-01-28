"use client";

import { useSession } from "next-auth/react";
import SidePanel from "./SidePanel";
import MainPanel from "../page";

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Only show layout with sidebar when authenticated
  if (status === "authenticated") {
    return (
      <div className="flex">
        <SidePanel />
        <MainPanel />
      </div>
    );
  }

  // For unauthenticated or loading state, just show children
  return <>{children}</>;
}
