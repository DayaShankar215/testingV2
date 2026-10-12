import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon, FaDesktop } from "react-icons/fa";

const options = [
  { value: "light", icon: FaSun, label: "Light" },
  { value: "dark", icon: FaMoon, label: "Dark" },
  { value: "system", icon: FaDesktop, label: "System" },
];

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === theme),
  );

  return (
    <div
      className="theme-toggle"
      role="radiogroup"
      aria-label="Color theme"
      title="Change theme"
    >
      <span
        className="theme-toggle-thumb"
        style={{ transform: `translateX(${activeIndex * 34}px)` }}
      />
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={theme === option.value}
            aria-label={option.label}
            title={option.label}
            className={theme === option.value ? "active" : ""}
            onClick={() => toggleTheme(option.value)}
          >
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
