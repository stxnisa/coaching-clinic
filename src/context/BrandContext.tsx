import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandContextType {
  logoUrl: string | null;
  brandName: string;
  brandSubtitle: string;
  updateLogo: (dataUrl: string | null) => void;
  updateBrandInfo: (name: string, subtitle: string) => void;
  resetBrand: () => void;
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const STORAGE_LOGO_KEY = 'edutest_custom_logo';
const STORAGE_NAME_KEY = 'edutest_brand_name';
const STORAGE_SUBTITLE_KEY = 'edutest_brand_subtitle';

const DEFAULT_NAME = 'Weekly Coaching Clinic';
const DEFAULT_SUBTITLE = 'Brain Academy by Ruangguru';
const DEFAULT_LOGO = '/brain-academy-logo.jpg';

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LOGO_KEY);
      return stored || DEFAULT_LOGO;
    } catch {
      return DEFAULT_LOGO;
    }
  });

  const [brandName, setBrandName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NAME_KEY);
      if (!stored || stored === 'LMS-Pro') return DEFAULT_NAME;
      return stored;
    } catch {
      return DEFAULT_NAME;
    }
  });

  const [brandSubtitle, setBrandSubtitle] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SUBTITLE_KEY);
      if (!stored || stored === 'EduTest Academy') return DEFAULT_SUBTITLE;
      return stored;
    } catch {
      return DEFAULT_SUBTITLE;
    }
  });

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (logoUrl) {
        localStorage.setItem(STORAGE_LOGO_KEY, logoUrl);
      } else {
        localStorage.removeItem(STORAGE_LOGO_KEY);
      }
    } catch (e) {
      console.warn('Failed to save custom logo to localStorage', e);
    }
  }, [logoUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NAME_KEY, brandName);
    } catch (e) {
      console.warn('Failed to save brand name to localStorage', e);
    }
  }, [brandName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBTITLE_KEY, brandSubtitle);
    } catch (e) {
      console.warn('Failed to save brand subtitle to localStorage', e);
    }
  }, [brandSubtitle]);

  const updateLogo = (dataUrl: string | null) => {
    setLogoUrl(dataUrl);
  };

  const updateBrandInfo = (name: string, subtitle: string) => {
    setBrandName(name.trim() || DEFAULT_NAME);
    setBrandSubtitle(subtitle.trim() || DEFAULT_SUBTITLE);
  };

  const resetBrand = () => {
    setLogoUrl(DEFAULT_LOGO);
    setBrandName(DEFAULT_NAME);
    setBrandSubtitle(DEFAULT_SUBTITLE);
    try {
      localStorage.removeItem(STORAGE_LOGO_KEY);
      localStorage.removeItem(STORAGE_NAME_KEY);
      localStorage.removeItem(STORAGE_SUBTITLE_KEY);
    } catch (e) {
      console.warn('Failed to clear brand storage', e);
    }
  };

  return (
    <BrandContext.Provider
      value={{
        logoUrl,
        brandName,
        brandSubtitle,
        updateLogo,
        updateBrandInfo,
        resetBrand,
        isBrandModalOpen,
        setIsBrandModalOpen,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
