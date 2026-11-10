import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import hi from "./hi.json";

import enHeaderUi from "./locales/en/commonUiComponent/headerUi.json";
import hiHeaderUi from "./locales/hi/commonUiComponent/headerUi.json";

import enCommon from "./locales/en/common.json";
import hiCommon from "./locales/hi/common.json";

import enFroms from "./locales/en/forms.json";
import hiFroms from "./locales/hi/forms.json";

import enHomepage from "./locales/en/frontendUi/homepage.json";
import hiHomepage from "./locales/hi/frontendUi/homepage.json";

import enAboutpage from "./locales/en/frontendUi/aboutpage.json";
import hiAboutpage from "./locales/hi/frontendUi/aboutpage.json";

import enContactUSpage from "./locales/en/frontendUi/contactuspage.json";
import hiContactUspage from "./locales/hi/frontendUi/contactuspage.json";

import enAllCoursespage from "./locales/en/frontendUi/allcoursespage.json";
import hiAllCoursespage from "./locales/hi/frontendUi/allcoursespage.json";

import enViewCoursespage from "./locales/en/frontendUi/viewcoursepage.json";
import hiViewCoursespage from "./locales/hi/frontendUi/viewcoursepage.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
      headerUi: enHeaderUi,
      common: enCommon,
      forms:enFroms,
      homepage: enHomepage,
      aboutpage:enAboutpage,
      contactuspage:enContactUSpage,
      allcourses:enAllCoursespage,
      viewcoursepage:enViewCoursespage,

    },
    hi: {
      translation: hi,
      headerUi: hiHeaderUi,
      common: hiCommon,
      forms:hiFroms,
      homepage: hiHomepage,
      aboutpage:hiAboutpage,
      contactuspage:hiContactUspage,
      allcourses:hiAllCoursespage,
      viewcoursepage:hiViewCoursespage,
    }
  },

  lng: localStorage.getItem("appLanguage") || "en",
  fallbackLng: "en",

  ns: ["translation", "headerUi", "common","forms","homepage","aboutpage","contactuspage","allcourses","viewcoursepage"],
  defaultNS: "translation",

  interpolation: {
    escapeValue: false
  }
});

export default i18n;