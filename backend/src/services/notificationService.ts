import { EventEmitter } from 'events';

export type NotificationType =
  | 'new_order'           // Pesanan baru dari consumer → admin
  | 'work_order_assigned' // Work order dibuat admin → worker
  | 'work_order_finished'; // Work order selesai oleh worker → admin

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  targetRole: 'admin' | 'worker';
  targetWorkerId?: string; // Untuk work_order_assigned, kirim ke worker tertentu
  data?: {
    orderNumber?: string;
    workOrderNumber?: string;
    transactionId?: string;
    workOrderId?: string;
  };
}

const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(100);

export function emitNotification(payload: NotificationPayload): void {
  notificationEmitter.emit('notification', payload);
  void import('./pushService')
    .then((m) => m.sendPushForNotification(payload))
    .catch((err) => console.error('Web Push:', err));
}

export function onNotification(callback: (payload: NotificationPayload) => void): () => void {
  notificationEmitter.on('notification', callback);
  return () => notificationEmitter.off('notification', callback);
}
