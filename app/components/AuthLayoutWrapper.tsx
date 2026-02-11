import "server-only";
import LayoutContent from "./LayoutContent";
import { getUser } from "../lib/data/user";
import { getAccountTypes } from "../lib/data/accountTypes";
import { getCategories } from "../lib/data/categories";

export default async function AuthLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getUser();
  if (!currentUser) {
    return <>{children}</>;
  }
  const accountTypes = await getAccountTypes(currentUser?.id);
  const categories = await getCategories(currentUser?.id);

  return <LayoutContent accounts={accountTypes} categories={categories} />;
}
