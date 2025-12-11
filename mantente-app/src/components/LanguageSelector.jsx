import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="languageDropdown">
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              className="dropdown-item"
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.flag} {lang.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;