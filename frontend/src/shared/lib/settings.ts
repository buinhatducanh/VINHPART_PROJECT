const SITE_NAME_KEY = 'vinhpart_site_name';
const DEFAULT_SITE_NAME = 'VINPART';
const LANGUAGE_KEY = 'vinhpart_language';
const DEFAULT_LANGUAGE = 'vi';
const THEME_KEY = 'vinhpart_theme';
const DEFAULT_THEME = 'auto';

export const getSiteName = (): string => {
    if (typeof window === 'undefined') return DEFAULT_SITE_NAME;
    return localStorage.getItem(SITE_NAME_KEY) || DEFAULT_SITE_NAME;
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

export const getTheme = (): string => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
};

export const saveTheme = (theme: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new Event('storage'));
};
