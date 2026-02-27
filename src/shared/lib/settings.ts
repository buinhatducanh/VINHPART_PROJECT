const SITE_NAME_KEY = 'vinhpart_site_name';
const DEFAULT_SITE_NAME = 'VINPART';

export const getSiteName = (): string => {
    if (typeof window === 'undefined') return DEFAULT_SITE_NAME;
    return localStorage.getItem(SITE_NAME_KEY) || DEFAULT_SITE_NAME;
};

export const saveSiteName = (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SITE_NAME_KEY, name);
    // Dispatch a storage event manually for the same window to detect changes
    window.dispatchEvent(new Event('storage'));
};
