const Toggle = ({ enabled, onChange, disabled = false, loading = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onChange(!enabled)}
      disabled={disabled || loading}
      className={`${
        enabled ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? "translate-x-5" : "translate-x-0"
        } pointer-events-none relative flex h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out items-center justify-center`}
      >
        {loading && (
          <svg
            className="animate-spin h-3 w-3 text-brand-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
      </span>
    </button>
  );
};

export default Toggle;
