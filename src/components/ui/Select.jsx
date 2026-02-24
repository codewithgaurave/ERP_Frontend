import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { accentColor, ACCENT_COLORS } = useTheme();

  const activeColorHex =
    ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || "#465FFF";

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border transition-all duration-200 rounded outline-none ${
          isOpen
            ? "border-slate-300 dark:border-gray-500 shadow-sm"
            : error
              ? "border-red-500"
              : "border-slate-200 dark:border-gray-700"
        } hover:border-slate-300 dark:hover:border-gray-600`}
        style={
          isOpen
            ? {
                ring: `1px solid ${activeColorHex}`,
                borderColor: activeColorHex,
              }
            : {}
        }
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`text-sm truncate ${!selectedOption ? "text-slate-400 font-normal" : "text-slate-700 dark:text-slate-200 font-semibold"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={isOpen ? { color: activeColorHex } : {}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded shadow-xl dark:shadow-none overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
            {options.map((option) => {
              const isActive = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-slate-50 dark:bg-gray-700 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700 font-medium"
                  }`}
                  style={isActive ? { color: activeColorHex } : {}}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
