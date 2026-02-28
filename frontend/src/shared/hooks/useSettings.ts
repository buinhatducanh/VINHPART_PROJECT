import { useState, useEffect } from 'react';
import { getSiteName, saveSiteName as saveSiteNameLib } from '../lib/settings';

export function useSettings() {
    const [siteName, setSiteNameState] = useState(getSiteName());

    useEffect(() => {
        const handleStorageChange = () => {
            setSiteNameState(getSiteName());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setSiteName = (newName: string) => {
        saveSiteNameLib(newName);
        setSiteNameState(newName);
    };

    return {
        siteName,
        setSiteName,
    };
}
