import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export type MessagePriority = 'info' | 'success' | 'warning' | 'error';

export interface QueuedMessage {
    id: string;
    type: MessagePriority;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number;
}

const PRIORITY_ORDER: Record<MessagePriority, number> = {
    error: 3,
    warning: 2,
    success: 1,
    info: 0,
};

const DISPLAY_DELAY_MS = 600; // delay between showing sequential toasts

let globalIdCounter = 0;

/**
 * useMessageQueue — manages a priority-based queue of user-facing toast messages.
 *
 * Features:
 * - Priority ordering: error > warning > success > info
 * - Sequential display: shows one toast at a time, avoiding overlapping floods
 * - Deduplication: prevents showing the same message twice (by ID)
 * - Action callbacks: toasts can have clickable action buttons
 *
 * Usage:
 *   const { enqueue, queueLength } = useMessageQueue();
 *   enqueue({ type: 'success', title: 'Đặt hàng thành công!', description: '...' });
 */
export function useMessageQueue() {
    const [queue, setQueue] = useState<QueuedMessage[]>([]);
    const processingRef = useRef(false);
    const shownIdsRef = useRef<Set<string>>(new Set());
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const enqueue = useCallback((message: Omit<QueuedMessage, 'id'> & { id?: string }) => {
        const id = message.id || `mq_${++globalIdCounter}_${Date.now()}`;

        // Deduplicate by ID
        if (shownIdsRef.current.has(id)) return;

        const fullMessage: QueuedMessage = { ...message, id };

        setQueue(prev => {
            const exists = prev.some(m => m.id === id);
            if (exists) return prev;

            return [...prev, fullMessage].sort(
                (a, b) => PRIORITY_ORDER[b.type] - PRIORITY_ORDER[a.type]
            );
        });
    }, []);

    const processNext = useCallback(() => {
        setQueue(prev => {
            if (prev.length === 0) {
                processingRef.current = false;
                return prev;
            }

            const [message, ...rest] = prev;
            shownIdsRef.current.add(message.id);

            // Show the toast
            const toastFn = message.type === 'error' ? toast.error
                : message.type === 'warning' ? toast.warning
                : message.type === 'success' ? toast.success
                : toast.info;

            toastFn(message.title, {
                description: message.description,
                duration: message.duration || 5000,
                action: message.action ? {
                    label: message.action.label,
                    onClick: message.action.onClick,
                } : undefined,
            });

            // Schedule next message
            if (rest.length > 0) {
                timerRef.current = setTimeout(() => processNext(), DISPLAY_DELAY_MS);
            } else {
                processingRef.current = false;
            }

            return rest;
        });
    }, []);

    // Start processing when new messages arrive
    useEffect(() => {
        if (queue.length > 0 && !processingRef.current) {
            processingRef.current = true;
            processNext();
        }
    }, [queue, processNext]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
        processingRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return {
        enqueue,
        clearQueue,
        queueLength: queue.length,
    };
}
