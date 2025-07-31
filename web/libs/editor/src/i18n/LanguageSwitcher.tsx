import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
import {Modal} from "antd";

const languages = [
  { code: 'en', lang: 'English' },
  { code: 'zh', lang: '简体中文' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    Modal.confirm({
      title: i18n.t('switch_lng_title'),
      content: i18n.t('switch_lng_info'),
      okText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      onOk() {
        i18n.changeLanguage(lng).then(() => {window.location.reload()})
      },
    });
  };

  return (
    <div className="language-switcher">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-switcher__select"
      >
        {languages.map((lng) => (
          <option
            key={lng.code}
            value={lng.code}
            className={
              i18n.language === lng.code
                ? 'language-switcher__option language-switcher__option--selected'
                : 'language-switcher__option'
            }
          >
            {lng.lang}
          </option>
        ))}
      </select>
      <div className="language-switcher__arrow">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
