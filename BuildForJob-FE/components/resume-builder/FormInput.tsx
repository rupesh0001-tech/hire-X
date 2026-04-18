import React from "react";
import { cn } from "@/lib/utils";

interface FormInputProps {
  name: string;
  label: string;
  icon?: React.ReactNode;
  value?: string;
  checked?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({
  name,
  label,
  icon,
  value,
  checked,
  type = "text",
  placeholder,
  disabled,
  onChange,
}: FormInputProps) => {
  if (type === "checkbox") {
    return (
      <div className="flex items-center gap-2 cursor-pointer group">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
        />
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-medium cursor-pointer transition-colors",
            disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400"
          )}
        >
          {label}
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
      >
        {icon}
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
            "w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-zinc-800"
        )}
      />
    </div>
  );
};

export default FormInput;
