import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Shared Theme Toggle component for editor headers
 */
export const ThemeToggle = ({
  theme,
  setTheme,
  isDark,
}: {
  theme: string;
  setTheme: (t: "light" | "dark" | "system") => void;
  isDark: boolean;
}) => (
  <div
    className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
  >
    {[
      { val: "light" as const, icon: Sun },
      { val: "dark" as const, icon: Moon },
      { val: "system" as const, icon: Monitor },
    ].map(({ val, icon: Icon }) => (
      <button
        key={val}
        onClick={() => setTheme(val)}
        className={`p-2 rounded transition-colors ${
          theme === val
            ? isDark
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-white text-gray-900 shadow-sm"
            : isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    ))}
  </div>
);

/**
 * Shared styling utility for editor fields
 */
const getFieldStyles = (isDark: boolean) => ({
  label: `block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`,
  input: `w-full p-2 rounded-lg border transition-colors ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
      : "bg-white border-gray-300 focus:border-blue-500"
  }`,
  select: `w-full p-3 rounded-lg border transition-colors ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
      : "bg-white border-gray-300 focus:border-blue-500"
  }`,
});

/**
 * Shared Input Group component
 */
export const InputGroup = ({
  label,
  value,
  onChange,
  isDark,
  type = "text",
  placeholder = "",
}: any) => {
  const styles = getFieldStyles(isDark);
  return (
    <div className="space-y-2">
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
};

/**
 * Shared Text Area Group component
 */
export const TextAreaGroup = ({
  label,
  value,
  onChange,
  isDark,
  rows = 4,
  placeholder = "",
}: any) => {
  const styles = getFieldStyles(isDark);
  return (
    <div className="space-y-2">
      <label className={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${styles.input} p-3`}
      />
    </div>
  );
};

/**
 * Shared Select Group component
 */
export const SelectGroup = ({
  label,
  value,
  options,
  onChange,
  isDark,
}: any) => {
  const styles = getFieldStyles(isDark);
  return (
    <div className="space-y-2">
      <label className={styles.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
      >
        {options.map((opt: string | { label: string; value: string }) => {
          const val = typeof opt === "string" ? opt.toLowerCase() : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

/**
 * Shared Tab Header component
 */
export const TabHeader = ({
  activeTab,
  tabs,
  onTabChange,
  isDark,
  activeColor = "blue",
}: any) => (
  <div
    className={`flex border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
  >
    {tabs.map((tab: string) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`px-4 py-3 text-sm font-medium capitalize transition-all ${
          activeTab === tab
            ? `border-b-2 border-${activeColor}-500 text-${activeColor}-500`
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);
