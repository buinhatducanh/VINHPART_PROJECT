import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { Notification } from '../types';
import { API_BASE_URL } from '@/lib/api';

const POLL_INTERVAL = 30_000;       // 30s normal polling
const POLL_INTERVAL_HIDDEN = 120_000; // 2min when tab hidden
const ERROR_BACKOFF_MAX = 300_000;   // 5min max backoff on errors

const playNotificationSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, context.currentTime + 0.1);

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

    const notifiedIdsRef = useRef<Set<string>>(new Set(
        JSON.parse(localStorage.getItem('notified_ids') || '[]')
    ));

    const [readIds, setReadIds] = useState<Set<string>>(() => {
        return new Set(JSON.parse(localStorage.getItem('read_notification_ids') || '[]'));
    });

    const consecutiveErrorsRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

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

    const getNextInterval = useCallback(() => {
        if (consecutiveErrorsRef.current > 0) {
            return Math.min(
                POLL_INTERVAL * Math.pow(2, consecutiveErrorsRef.current),
                ERROR_BACKOFF_MAX
            );
        }
        return document.hidden ? POLL_INTERVAL_HIDDEN : POLL_INTERVAL;
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (userEmail === 'DO_NOT_FETCH') {
            setLoading(false);
            return;
        }

        try {
            const url = userEmail
                ? `${API_BASE_URL}/notifications/user?email=${encodeURIComponent(userEmail)}`
                : `${API_BASE_URL}/notifications`;
            const response = await fetch(url);
            const data = await response.json();
            const safeData = Array.isArray(data) ? data : [];
            setNotifications(safeData);

            consecutiveErrorsRef.current = 0; // Reset on success

            let hasNew = false;

            safeData.forEach((notif: Notification) => {
                if (!notifiedIdsRef.current.has(notif.id)) {
                    hasNew = true;
                    notifiedIdsRef.current.add(notif.id);

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
            consecutiveErrorsRef.current++;
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    // Schedule next poll with dynamic interval
    const scheduleNext = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            await fetchNotifications();
            scheduleNext();
        }, getNextInterval());
    }, [fetchNotifications, getNextInterval]);

    useEffect(() => {
        requestPermission();
        fetchNotifications().then(() => scheduleNext());

        // Adjust polling when tab visibility changes
        const handleVisibility = () => {
            if (!document.hidden) {
                // Tab became visible: fetch immediately and reschedule
                fetchNotifications();
                scheduleNext();
            } else {
                // Tab hidden: reschedule with longer interval
                scheduleNext();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearTimeout(timerRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [userEmail, fetchNotifications, scheduleNext]);

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
