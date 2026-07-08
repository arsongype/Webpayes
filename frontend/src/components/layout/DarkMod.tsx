import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-yellow-400 dark:text-yellow-300 transition-all duration-300 transform hover:scale-110"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="transition-transform" />
      ) : (
        <Moon size={20} className="transition-transform" />
      )}
    </button>
  );
};

export default DarkModeToggle;
