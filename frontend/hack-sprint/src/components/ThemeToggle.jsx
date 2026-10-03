import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

// A track-and-knob switch (not a plain checkbox) whose knob slides and whose
// icon crossfades/rotates on toggle — the animation is what makes it read as
// a deliberate, polished control rather than a bare on/off input.
const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border border-border bg-secondary transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <span
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-300 ease-out ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        <Sun
          size={13}
          className={`absolute text-primary transition-all duration-300 ${
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <Moon
          size={13}
          className={`absolute text-primary transition-all duration-300 ${
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
