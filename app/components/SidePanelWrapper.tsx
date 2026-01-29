"use client";

import { Button } from "@radix-ui/themes";
import { useState } from "react";
import { IoMdClose, IoMdMenu } from "react-icons/io";

export default function SidePanelWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex h-full">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
      </Button>

      {isOpen && (
        <Button
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-all duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative md:flex md:flex-col
          w-64 h-full bg-slate-800 flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {children}
      </aside>

      <div className="flex-1" />
    </div>
  );
}
