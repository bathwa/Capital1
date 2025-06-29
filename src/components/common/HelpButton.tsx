import React, { useState } from 'react';
import { HelpCircle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpButtonProps {
  content: string;
  audioContent?: string;
  className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ content, audioContent, className = '' }) => {
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useTranslation();

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // TODO: Set based on current language
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title={t('help.showMeHow')}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {showHelp && (
        <div className="absolute z-50 w-80 p-4 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('help.showMeHow')}
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => speakText(audioContent || content)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Listen to explanation"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

export default HelpButton;