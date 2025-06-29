import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const getThemeDisplay = () => {
    if (i18n.language === 'nd') {
      return theme === 'light' ? 'Emnyama' : 'Ekhanyayo';
    } else {
      return theme === 'light' ? 'Dark' : 'Light';
    }
  };

  const getTooltip = () => {
    if (i18n.language === 'nd') {
      return theme === 'light' ? 'Shintshela kwitimu emnyama' : 'Shintshela kwitimu ekhanyayo';
    } else {
      return theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={getTooltip()}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {getThemeDisplay()}
      </span>
    </button>
  );
};

export default ThemeToggle;