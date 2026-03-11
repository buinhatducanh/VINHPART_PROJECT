import { useState, useEffect } from 'react';
import {
    getSiteName,
    saveSiteName as saveSiteNameLib,
    getLanguage,
    saveLanguage as saveLanguageLib,
} from '../lib/settings';

export function useSettings() {
    const [siteName, setSiteNameState] = useState(getSiteName());
    const [language, setLanguageState] = useState(getLanguage());

    useEffect(() => {
        const handleStorageChange = () => {
            setSiteNameState(getSiteName());
            setLanguageState(getLanguage());
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

    return {
        siteName,
        setSiteName,
        language,
        setLanguage,
    };
}
