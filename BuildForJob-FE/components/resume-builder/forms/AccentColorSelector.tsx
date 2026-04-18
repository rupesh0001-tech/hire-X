"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setAccentColor } from "@/lib/store/features/resume-slice";
import { ChevronDown, Pipette } from "lucide-react";

const colorPresets = [
  { name: "Blue", code: "#3b82f6" },
  { name: "Green", code: "#22c55e" },
  { name: "Red", code: "#ef4444" },
  { name: "Yellow", code: "#f59e0b" },
  { name: "Purple", code: "#8b5cf6" },
  { name: "Orange", code: "#f97316" },
  { name: "Teal", code: "#14b8a6" },
  { name: "Black", code: "#000000" },
];

const AccentColorSelector = () => {
  const dispatch = useDispatch();
  const { accentColor: activeColor } = useSelector((state: RootState) => state.resume);
  const [isOpen, setIsOpen] = useState(false);

  const selectedColor = colorPresets.find((c) => c.code === activeColor) || colorPresets[0];

  const handleSelect = (colorCode: string) => {
    dispatch(setAccentColor(colorCode));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
      >
        <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: selectedColor.code }} />
        <span className="hidden sm:inline">{selectedColor.name}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-20 p-2 grid grid-cols-2 gap-1 animate-in fade-in zoom-in duration-200">
            {colorPresets.map((color) => (
              <li
                key={color.code}
                className={`px-3 py-2 text-xs cursor-pointer rounded-lg flex items-center gap-2 transition-colors ${
                  color.code === activeColor
                    ? "bg-gray-100 dark:bg-white/10 font-bold"
                    : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 font-medium"
                }`}
                onClick={() => handleSelect(color.code)}
              >
                <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: color.code }} />
                {color.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AccentColorSelector;
