"use client";

import React from "react";
import { SubCategory } from "@prisma/client";

type SubCategoryTableProps = Readonly<{
  subCategories: SubCategory[];
}>;

export default function SubCategoryTable({
  subCategories,
}: SubCategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs table-fixed">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2 text-left font-medium text-slate-600 w-[40%]">
              Name
            </th>
            <th className="px-4 py-2 text-right font-medium text-slate-600 w-[20%]">
              Budgeted
            </th>
            <th className="px-4 py-2 text-right font-medium text-slate-600 w-[25%]">
              Spent
            </th>
            <th className="px-4 py-2 text-right font-medium text-slate-600 w-[15%]">
              Left
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {subCategories.map((subCategory) => {
            const spent = 0;
            const left = subCategory.budgeted - spent;
            const percentSpent = (spent / subCategory.budgeted) * 100 || 0;

            return (
              <tr
                key={subCategory.id}
                className="bg-white hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">
                      {subCategory.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-2 text-right">
                  <span className="font-medium text-slate-700">
                    ${subCategory.budgeted.toFixed(2)}
                  </span>
                </td>

                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(percentSpent, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium text-rose-600 text-xs min-w-[48px] text-right">
                      $0.00
                    </span>
                  </div>
                </td>

                <td className="px-4 py-2 text-right">
                  <span className="font-medium text-emerald-600">
                    ${left.toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
