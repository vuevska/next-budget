import SidePanel from "./SidePanel";
import SidePanelWrapper from "./SidePanelWrapper";
import MainPanel from "../page";
import { getServerSession } from "next-auth";
import authOptions from "../lib/authOptions";

export default async function AuthLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanelWrapper>
        <SidePanel />
      </SidePanelWrapper>
      <main className="flex-1 h-full overflow-y-auto">
        <MainPanel />
      </main>
    </div>
  );
}
