import { useSession } from "next-auth/react";
import { Box } from "@radix-ui/themes";
import SignOutButton from "./signout/SignOutButton";
import { TbUserDollar } from "react-icons/tb";

export default function SidePanel() {
  const { data: session } = useSession();

  return (
    <aside className="w-64 min-h-screen bg-slate-800 flex flex-col">
      <div className="m-2 p-5 text-white">
        <h2 className="text-xl font-bold">Next Budget</h2>
      </div>

      <Box className="flex-1 p-5">Account Types</Box>

      <div className="p-5 border-t border-slate-700">
        {session?.user && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <TbUserDollar size={28} color="white" />
              </div>

              <div>
                <p className="text-white font-medium text-sm">
                  {session.user.name}
                </p>
                <p className="text-slate-400 text-xs">{session.user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        )}
      </div>
    </aside>
  );
}
