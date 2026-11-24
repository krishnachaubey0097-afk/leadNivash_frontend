import { apiClient } from './client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'inquiry' | 'match' | 'deal' | 'system';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const res: any = await apiClient.get('/notifications');
  if (res && Array.isArray(res.notifications)) {
    return res as NotificationsResponse;
  }
  return res?.data || { notifications: [], unreadCount: 0 };
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`, {});
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all', {});
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  await apiClient.delete('/notifications/clear-all');
};
