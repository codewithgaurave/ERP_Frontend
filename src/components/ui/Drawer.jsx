import { useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export const Drawer = ({ onClose, children, title, footer }) => {
  const { accentColor, ACCENT_COLORS } = useTheme();

  // Find the current hex code for the accent color
  const activeColorHex =
    ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || "#465FFF";

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-[20]">
        <h2
          className="text-lg font-bold dark:text-white flex items-center gap-2"
          style={{ color: activeColorHex }}
        >
          <span
            className="w-1.5 h-6 rounded-full"
            style={{ backgroundColor: activeColorHex }}
          ></span>
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all active:scale-95"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        className={`flex-1 overflow-y-auto no-scrollbar p-6 ${footer ? "pb-32" : ""}`}
      >
        {children}
      </div>

      {/* Fixed Footer */}
      {footer && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-[20]">
          {footer}
        </div>
      )}
    </div>
  );
};
