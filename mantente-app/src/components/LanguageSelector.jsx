import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setShowModal(false);
  };

  return (
    <>
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => setShowModal(true)}
        title="Cambiar idioma"
      >
        {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
      </button>

      {showModal && (
        <div className="language-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="language-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="language-modal-header">
              <h5>Seleccionar Idioma</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="language-modal-body">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;