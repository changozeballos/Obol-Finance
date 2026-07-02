import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'es';
const supportedLang = ['es', 'en', 'pt'].includes(deviceLang) ? deviceLang : 'es';

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, pt: { translation: pt } },
  lng: supportedLang,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
