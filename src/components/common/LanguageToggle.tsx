import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'nd' : 'en';
    i18n.changeLanguage(newLang);
  };

  const getLanguageDisplay = () => {
    if (i18n.language === 'en') {
      return 'isiNdebele';
    } else {
      return 'English';
    }
  };

  const getTooltip = () => {
    if (i18n.language === 'en') {
      return 'Shintshela ku-isiNdebele';
    } else {
      return 'Switch to English';
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={getTooltip()}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {getLanguageDisplay()}
      </span>
    </button>
  );
};

export default LanguageToggle;