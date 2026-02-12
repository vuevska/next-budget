import { SubCategory } from "@prisma/client";
import { Button } from "@radix-ui/themes";
import { FilterState } from "./filter/transactionFilters";

interface FilterRowProps {
  filters: FilterState;
  subCategories: SubCategory[];
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}

const FilterRow = ({
  filters,
  subCategories,
  onFilterChange,
  onClearFilters,
}: FilterRowProps) => {
  return (
    <tr className="bg-slate-50 border-b border-slate-200">
      <td className="px-6 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="date"
            placeholder="From"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="To"
            value={filters.dateTo}
            onChange={(e) => onFilterChange("dateTo", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </td>
      <td className="px-6 py-3">
        <input
          type="text"
          placeholder="Filter payee..."
          value={filters.payee}
          onChange={(e) => onFilterChange("payee", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="text"
          placeholder="Filter description..."
          value={filters.description}
          onChange={(e) => onFilterChange("description", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-3">
        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          <option key={null} value={"To be Budgeted"}>
            To be Budgeted
          </option>
          {subCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.amountMin}
            onChange={(e) => onFilterChange("amountMin", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.amountMax}
            onChange={(e) => onFilterChange("amountMax", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>
      </td>
      <td className="px-6 py-3">
        <select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          <option value="inflow">Inflow</option>
          <option value="outflow">Outflow</option>
        </select>
      </td>
      <td className="px-6 py-3 text-center">
        <Button
          onClick={onClearFilters}
          className="px-2 py-1 text-xs bg-slate-300 hover:bg-slate-400 text-slate-700 rounded transition-colors"
          title="Clear all filters"
        >
          Clear
        </Button>
      </td>
    </tr>
  );
};

export default FilterRow;
