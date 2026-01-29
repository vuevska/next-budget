import { getCategories } from "./lib/categories";
import CategoryList from "./components/categories/CategoryList";

export default async function MainPanel() {
  const categories = await getCategories();

  return (
    <div className="w-full">
      <CategoryList categories={categories} />
    </div>
  );
}
