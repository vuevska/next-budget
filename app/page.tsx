import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  const issue = await prisma.account.findMany();
  console.log(issue);

  return (
    <main>
      <div className="m-2">Main Panel</div>
    </main>
  );
}
