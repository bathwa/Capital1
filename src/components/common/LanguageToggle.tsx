import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'nd' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={i18n.language === 'en' ? 'Switch to isiNdebele' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'isiNdebele' : 'English'}
      </span>
    </button>
  );
};

export default LanguageToggle;