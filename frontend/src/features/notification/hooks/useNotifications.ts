import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { Notification } from '../types';
import { API_BASE_URL } from '@/lib/api';

// SSE must connect directly to backend (Vercel proxy doesn't support long-lived connections)
// VITE_SSE_URL or VITE_API_URL should point to the actual backend, e.g. https://vinhpart-api.onrender.com/api
const SSE_BASE_URL = import.meta.env.VITE_SSE_URL || import.meta.env.VITE_API_URL || API_BASE_URL;

// Fallback polling only if SSE fails
const FALLBACK_POLL_INTERVAL = 60_000; // 1min fallback (only used when SSE is down)

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

    const eventSourceRef = useRef<EventSource | null>(null);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const useSSERef = useRef(true);

    const markAsRead = (id: string, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        setReadIds(prev => {
            const next = new Set(prev).add(id);
            localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const markAllAsRead = (event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
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

    // Show notification to user (toast + browser notification + sound)
    const showNotification = useCallback((notif: Notification) => {
        if (notifiedIdsRef.current.has(notif.id)) return;

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

        playNotificationSound();

        const currentSaved = new Set(JSON.parse(localStorage.getItem('notified_ids') || '[]') as string[]);
        notifiedIdsRef.current.forEach(id => currentSaved.add(id));
        localStorage.setItem('notified_ids', JSON.stringify(Array.from(currentSaved)));
    }, []);

    // Fetch initial notifications via REST (one-time on mount)
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
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    // Connect to SSE stream for real-time updates
    const connectSSE = useCallback(() => {
        if (userEmail === 'DO_NOT_FETCH') return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const streamUrl = userEmail
            ? `${SSE_BASE_URL}/notifications/stream?email=${encodeURIComponent(userEmail)}`
            : `${SSE_BASE_URL}/notifications/stream`;

        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.addEventListener('new_order', (e) => {
            const notif = JSON.parse(e.data) as Notification;
            setNotifications(prev => [notif, ...prev]);
            showNotification(notif);
        });

        es.addEventListener('order_status', (e) => {
            const notif = JSON.parse(e.data) as Notification;
            setNotifications(prev => {
                // Replace existing notification for this order+status or prepend
                const exists = prev.some(n => n.id === notif.id);
                if (exists) return prev.map(n => n.id === notif.id ? notif : n);
                return [notif, ...prev];
            });
            showNotification(notif);
        });

        es.addEventListener('connected', () => {
            useSSERef.current = true;
            // Clear fallback polling since SSE is working
            clearTimeout(fallbackTimerRef.current);
        });

        es.onerror = () => {
            es.close();
            eventSourceRef.current = null;
            useSSERef.current = false;

            // Fall back to polling if SSE fails
            startFallbackPolling();
        };
    }, [userEmail, showNotification]);

    // Fallback polling (only used when SSE is unavailable)
    const startFallbackPolling = useCallback(() => {
        clearTimeout(fallbackTimerRef.current);

        const poll = async () => {
            await fetchNotifications();

            // Try to reconnect SSE every poll cycle
            if (!useSSERef.current) {
                connectSSE();
            }

            // Continue polling if SSE is still down
            if (!useSSERef.current) {
                fallbackTimerRef.current = setTimeout(poll, FALLBACK_POLL_INTERVAL);
            }
        };

        fallbackTimerRef.current = setTimeout(poll, FALLBACK_POLL_INTERVAL);
    }, [fetchNotifications, connectSSE]);

    useEffect(() => {
        if (userEmail === 'DO_NOT_FETCH') {
            setLoading(false);
            return;
        }

        requestPermission();

        // 1. Fetch initial data via REST
        fetchNotifications();

        // 2. Connect SSE for real-time updates
        connectSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            clearTimeout(fallbackTimerRef.current);
        };
    }, [userEmail, fetchNotifications, connectSSE]);

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
