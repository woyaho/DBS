// 公告相关API
import { request } from './request';

export const announcementAPI = {
  // 获取公告列表
  getAnnouncements: async (params) => {
    return request('/announcements', {
      method: 'GET',
      params
    });
  },

  // 获取公告详情
  getAnnouncement: async (announcementId) => {
    return request(`/announcements/${announcementId}`, {
      method: 'GET'
    });
  },

  // 创建公告
  createAnnouncement: async (data) => {
    return request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 更新公告
  updateAnnouncement: async (announcementId, data) => {
    return request(`/announcements/${announcementId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除公告
  deleteAnnouncement: async (announcementId) => {
    return request(`/announcements/${announcementId}`, {
      method: 'DELETE'
    });
  },

  // 获取课程公告列表
  getCourseAnnouncements: async (courseId) => {
    return request(`/courses/${courseId}/announcements`, {
      method: 'GET'
    });
  }
};
