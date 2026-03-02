export interface Notification {
    id: string;
    type: 'order' | 'order_status';
    title: string;
    message: string;
    orderId: string;
    createdAt: string;
    amount: number;
    status?: string;
}
