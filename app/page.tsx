import { redirect } from "next/navigation";
import { getAccountTypes } from "./lib/data/account-type";
import { getCategories } from "./lib/data/category";
import { getToBeBudgeted } from "./lib/data/budget";
import LayoutContent from "./components/LayoutContent";
import { requireAuth } from "./lib/auth";
import { NextResponse } from "next/server";

export default async function HomePage() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const currentUser = authResult;

  if (!currentUser) {
    redirect("/auth/signin");
  }

  const accountTypes = await getAccountTypes(currentUser.id);
  const categories = await getCategories(currentUser.id);
  const toBeBudgeted = await getToBeBudgeted(currentUser.id);

  return (
    <LayoutContent
      accounts={accountTypes}
      categories={categories}
      user={currentUser}
      toBeBudgeted={toBeBudgeted}
    />
  );
}
