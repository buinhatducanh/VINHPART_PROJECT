import { useState, useEffect } from 'react';
import {
    getSiteName,
    saveSiteName as saveSiteNameLib,
    getLanguage,
    saveLanguage as saveLanguageLib,
    getTheme,
    saveTheme as saveThemeLib
} from '../lib/settings';

export function useSettings() {
    const [siteName, setSiteNameState] = useState(getSiteName());
    const [language, setLanguageState] = useState(getLanguage());
    const [theme, setThemeState] = useState(getTheme());

    useEffect(() => {
        const handleStorageChange = () => {
            setSiteNameState(getSiteName());
            setLanguageState(getLanguage());
            setThemeState(getTheme());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setSiteName = (newName: string) => {
        saveSiteNameLib(newName);
        setSiteNameState(newName);
    };

    const setLanguage = (newLang: string) => {
        saveLanguageLib(newLang);
        setLanguageState(newLang);
    };

    const setTheme = (newTheme: string) => {
        saveThemeLib(newTheme);
        setThemeState(newTheme);
    };

    return {
        siteName,
        setSiteName,
        language,
        setLanguage,
        theme,
        setTheme,
    };
}
