// 通知相关API
import { request } from './request';

export const notificationAPI = {
  // 获取通知列表
  getNotifications: async (params) => {
    return request('/notifications', {
      method: 'GET',
      params
    });
  },

  // 获取通知详情
  getNotification: async (notificationId) => {
    return request(`/notifications/${notificationId}`, {
      method: 'GET'
    });
  },

  // 标记通知为已读
  markAsRead: async (notificationId) => {
    return request(`/notifications/${notificationId}/read`, {
      method: 'POST'
    });
  },

  // 删除通知
  deleteNotification: async (notificationId) => {
    return request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }
};
