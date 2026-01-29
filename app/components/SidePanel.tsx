import { Box } from "@radix-ui/themes";
import SignOutButton from "./signout/SignOutButton";
import { TbUserDollar } from "react-icons/tb";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "../lib/authOptions";
import { AccountType } from "@prisma/client";
import AccountList from "./account-types/AccountList";

export default async function SidePanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Please log in to see your issues.</div>;
  }
  const accountTypesByUser: AccountType[] = await prisma.accountType.findMany({
    where: { user: session.user },
  });

  return (
    <>
      <div className="m-2 p-5 text-white">
        <h2 className="text-xl font-bold">Next Budget</h2>
      </div>

      <Box className="flex-1 p-5 overflow-hidden">
        <AccountList accounts={accountTypesByUser} />
      </Box>

      <div className="p-5 border-t border-slate-700">
        {session?.user && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
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
    </>
  );
}
