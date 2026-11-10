import React from 'react'
import { useTranslation } from 'react-i18next';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const isHindi = i18n.language.startsWith("hi");

  const handleLanguageChange = (event) => {
    const language = event.target.checked ? "hi" : "en";

    i18n.changeLanguage(language);
    localStorage.setItem("appLanguage", language);
  };

  return (
    <div className="lang-switch">
      <span className={!isHindi ? "active" : ""}>EN</span>

      <label className="switch">
        <input
          type="checkbox"
          checked={isHindi}
          onChange={handleLanguageChange}
        />
        <span className="slider"></span>
      </label>

      <span className={isHindi ? "active" : ""}>HI</span>
    </div>
  );
};

export default LanguageSwitch;