import apiClient from './client';

export interface Notification {
  id: number;
  userId: number;
  type: 'APPOINTMENT_APPROVED' | 'APPOINTMENT_REJECTED' | 'POST_APPROVED' | 'POST_REJECTED' | 'VIP_EXPIRING' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  refId?: number | null;
  refType?: 'appointment' | 'post' | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  unreadCount: number;
}

export const notificationApi = {
  // Lấy danh sách thông báo
  getAll: (page = 1, limit = 20) =>
    apiClient.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`),

  // Lấy số thông báo chưa đọc
  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/notifications/unread-count'),

  // Đánh dấu một thông báo đã đọc
  markAsRead: (id: number) =>
    apiClient.patch(`/notifications/${id}/read`),

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () =>
    apiClient.patch('/notifications/mark-all-read'),

  // Xóa một thông báo
  delete: (id: number) =>
    apiClient.delete(`/notifications/${id}`),

  // Xóa tất cả thông báo đã đọc
  deleteAllRead: () =>
    apiClient.delete('/notifications/read'),
};
