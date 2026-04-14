import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'BENCADİ',
    siteTagline: 'Votre maison, notre passion',
    logo: '',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    socialLinks: {},
    aboutUs: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsAPI.get();
        setSettings(data.settings);
      } catch (e) {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '';
    return `${Number(amount).toLocaleString('fr-FR')} ${settings.currencySymbol || 'FCFA'}`;
  };

  const refresh = async () => {
    try {
      const { data } = await settingsAPI.get();
      setSettings(data.settings);
    } catch {}
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, formatPrice, refresh, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
