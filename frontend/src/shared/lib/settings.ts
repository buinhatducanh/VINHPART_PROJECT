const SITE_NAME_KEY = 'vinhpart_site_name';
const DEFAULT_SITE_NAME = 'VINHPART';
const LANGUAGE_KEY = 'vinhpart_language';

export const getSiteName = (): string => {
    if (typeof window === 'undefined') return DEFAULT_SITE_NAME;
    const stored = localStorage.getItem(SITE_NAME_KEY);
    // Auto-fix old cached value "VINPART" → "VINHPART"
    if (stored && stored.toUpperCase() === 'VINPART') {
        localStorage.setItem(SITE_NAME_KEY, 'VINHPART');
        return 'VINHPART';
    }
    return stored || DEFAULT_SITE_NAME;
};

export const saveSiteName = (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SITE_NAME_KEY, name);
    window.dispatchEvent(new Event('storage'));
};

export const getLanguage = (): string => {
    return 'vi';
};

export const saveLanguage = (lang: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANGUAGE_KEY, lang);
    window.dispatchEvent(new Event('storage'));
};
