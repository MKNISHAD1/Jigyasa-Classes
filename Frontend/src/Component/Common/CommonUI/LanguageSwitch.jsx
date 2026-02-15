import React from 'react'
import { useTranslation } from 'react-i18next';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const isHindi = i18n.language === "hi";

  return (
    <div className="lang-switch">
      <span className={!isHindi ? "active" : ""}>EN</span>

      <label className="switch">
        <input
          type="checkbox"
          checked={isHindi}
          onChange={() =>
            i18n.changeLanguage(isHindi ? "en" : "hi")
          }
        />
        <span className="slider"></span>
      </label>

      <span className={isHindi ? "active" : ""}>HI</span>
    </div>
  );
};

export default LanguageSwitch;