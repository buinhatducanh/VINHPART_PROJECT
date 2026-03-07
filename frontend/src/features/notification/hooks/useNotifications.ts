import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Notification } from '../types';

const playNotificationSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1760, context.currentTime + 0.1); // A6

        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
        console.error('Audio play failed:', e);
    }
};

export function useNotifications(userEmail?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Use ref to prevent stale closures in setInterval
    const notifiedIdsRef = useRef<Set<string>>(new Set(
        JSON.parse(localStorage.getItem('notified_ids') || '[]')
    ));

    const [readIds, setReadIds] = useState<Set<string>>(() => {
        return new Set(JSON.parse(localStorage.getItem('read_notification_ids') || '[]'));
    });

    const markAsRead = (id: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        setReadIds(prev => {
            const next = new Set(prev).add(id);
            localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const markAllAsRead = (event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        setReadIds(prev => {
            const next = new Set(prev);
            notifications.forEach(n => next.add(n.id));
            localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const requestPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    const fetchNotifications = async () => {
        if (userEmail === 'DO_NOT_FETCH') {
            setLoading(false);
            return;
        }

        try {
            const url = userEmail
                ? `/api/notifications/user?email=${encodeURIComponent(userEmail)}`
                : '/api/notifications';
            const response = await fetch(url);
            const data = await response.json();
            setNotifications(data);

            let hasNew = false;

            // Trigger browser notifications & toasts for new items
            data.forEach((notif: Notification) => {
                if (!notifiedIdsRef.current.has(notif.id)) {
                    hasNew = true;
                    notifiedIdsRef.current.add(notif.id);

                    // Show Toast inside the app
                    toast.success(notif.title, {
                        description: notif.message,
                        duration: 5000,
                    });

                    if ('Notification' in window && Notification.permission === 'granted') {
                        new window.Notification(notif.title, {
                            body: notif.message,
                            icon: '/logo192.png'
                        });
                    }
                }
            });

            if (hasNew) {
                playNotificationSound();
                const currentSaved = new Set(JSON.parse(localStorage.getItem('notified_ids') || '[]') as string[]);
                notifiedIdsRef.current.forEach(id => currentSaved.add(id));
                localStorage.setItem('notified_ids', JSON.stringify(Array.from(currentSaved)));
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
        // Poll for new notifications every 5 seconds
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [userEmail]);

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    return {
        notifications,
        unreadCount,
        readIds,
        markAsRead,
        markAllAsRead,
        loading,
        refresh: fetchNotifications
    };
}
