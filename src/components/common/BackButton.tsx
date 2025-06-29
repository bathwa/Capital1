import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, onClick, className = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm font-medium">{t('common.back')}</span>
    </button>
  );
};

export default BackButton;