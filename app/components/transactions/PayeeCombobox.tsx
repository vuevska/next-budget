"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiPlus, FiSearch } from "react-icons/fi";
import { Payee } from "@prisma/client";

interface PayeeComboboxProps {
  payees: Payee[];
  value: number | null;
  onChange: (payeeId: number | null) => void;
  onCreatePayee: (name: string) => Promise<Payee>;
  error?: string;
}

export default function PayeeCombobox({
  payees,
  value,
  onChange,
  onCreatePayee,
  error,
}: PayeeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPayee = payees.find((p) => p.id === value);

  const filteredPayees = payees.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const exactMatch = payees.some(
    (p) => p.name.toLowerCase() === search.trim().toLowerCase(),
  );

  const showCreateOption = search.trim().length > 0 && !exactMatch;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset search to selected payee name when closing
        if (selectedPayee) {
          setSearch(selectedPayee.name);
        } else {
          setSearch("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedPayee]);

  // Sync search text when value changes externally
  useEffect(() => {
    if (selectedPayee) {
      setSearch(selectedPayee.name);
    } else {
      setSearch("");
    }
  }, [value, selectedPayee]);

  const handleSelect = (payee: Payee) => {
    setSearch(payee.name);
    onChange(payee.id);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const newPayee = await onCreatePayee(name);
      handleSelect(newPayee);
    } catch (err) {
      console.error("Failed to create payee:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (!isOpen) setIsOpen(true);

    // Clear selection if user is typing something different
    if (selectedPayee && val !== selectedPayee.name) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Select all text on focus to make it easy to replace
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <FiSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search or type a payee..."
          className={`w-full pl-9 pr-9 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <FiChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredPayees.length > 0 && (
            <ul>
              {filteredPayees.map((payee) => (
                <li key={payee.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(payee)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      payee.id === value
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {payee.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showCreateOption && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2 border-t border-slate-100 disabled:opacity-50"
            >
              <FiPlus size={14} />
              {isCreating ? "Creating..." : `Create "${search.trim()}"`}
            </button>
          )}

          {filteredPayees.length === 0 && !showCreateOption && (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">
              No payees found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
