import CategoryList from "./components/categories/CategoryList";
import { getServerSession } from "next-auth";
import authOptions from "./lib/authOptions";
import prisma from "@/prisma/client";

export default async function MainPanel() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Please log in to see your issues.</div>;
  }
  const categories = await prisma.category.findMany({
    where: { user: session.user },
    include: { SubCategory: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="w-full">
      <CategoryList categories={categories} />
    </div>
  );
}
