import { useState, useEffect } from 'react';
import type { Notification } from '../types';

export function useNotifications(userEmail?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('notified_ids');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const requestPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    const fetchNotifications = async () => {
        try {
            const url = userEmail
                ? `http://localhost:3001/api/notifications/user?email=${encodeURIComponent(userEmail)}`
                : 'http://localhost:3001/api/notifications';
            const response = await fetch(url);
            const data = await response.json();
            setNotifications(data);

            // Trigger browser notifications for new items
            if (userEmail && 'Notification' in window && Notification.permission === 'granted') {
                data.forEach((notif: Notification) => {
                    if (!notifiedIds.has(notif.id)) {
                        new window.Notification(notif.title, {
                            body: notif.message,
                            icon: '/logo192.png' // Adjust if you have a specific icon
                        });
                        setNotifiedIds(prev => {
                            const next = new Set(prev).add(notif.id);
                            localStorage.setItem('notified_ids', JSON.stringify(Array.from(next)));
                            return next;
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        requestPermission();
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userEmail]);

    return {
        notifications,
        unreadCount: notifications.length,
        loading,
        refresh: fetchNotifications
    };
}
