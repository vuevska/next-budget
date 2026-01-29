import SidePanel from "./SidePanel";
import MainPanel from "../page";
import { getServerSession } from "next-auth";
import authOptions from "../lib/authOptions";

export default async function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidePanel />
        <main className="flex-1 h-full overflow-y-auto">
          <MainPanel />
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
