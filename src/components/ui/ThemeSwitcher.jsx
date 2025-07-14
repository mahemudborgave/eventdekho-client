import { useTheme } from './ThemeProvider';
import { Button } from './button';
import { Sun, Moon } from 'lucide-react';
import React from 'react';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="relative overflow-hidden">
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ opacity: theme === 'dark' ? 1 : 0, transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
        <Sun className="w-5 h-5 transition-all duration-500" />
      </span>
      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ opacity: theme === 'light' ? 1 : 0, transform: theme === 'light' ? 'rotate(0deg)' : 'rotate(90deg)' }}>
        <Moon className="w-5 h-5 transition-all duration-500" />
      </span>
      <span className="opacity-0">
        {/* For button sizing */}
        <Sun className="w-5 h-5" />
      </span>
    </Button>
  );
} 