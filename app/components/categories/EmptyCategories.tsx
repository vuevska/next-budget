import { FaWallet } from "react-icons/fa";

const EmptyCategories = () => {
  return (
    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
        <FaWallet size={18} className="text-slate-400" />
      </div>
      <h3 className="text-slate-800 text-lg font-semibold mb-1">
        No Categories Yet
      </h3>
      <p className="text-slate-600 text-sm">
        Start organizing your budget by creating your first category
      </p>
    </div>
  );
};

export default EmptyCategories;
