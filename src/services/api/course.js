// 课程相关API
import { request } from './request';

export const courseAPI = {
  // 获取课程列表
  getCourses: async (params) => {
    return request('/courses', {
      method: 'GET',
      params
    });
  },

  // 创建课程
  createCourse: async (data) => {
    return request('/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取课程详情
  getCourse: async (courseId) => {
    return request(`/courses/${courseId}`, {
      method: 'GET'
    });
  },

  // 更新课程
  updateCourse: async (courseId, data) => {
    return request(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除课程
  deleteCourse: async (courseId) => {
    return request(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  },

  // 加入课程
  joinCourse: async (courseId) => {
    return request(`/courses/${courseId}/join`, {
      method: 'POST'
    });
  },

  // 退出课程
  leaveCourse: async (courseId) => {
    return request(`/courses/${courseId}/leave`, {
      method: 'POST'
    });
  },

  // 获取课程成员
  getCourseMembers: async (courseId) => {
    return request(`/courses/${courseId}/members`, {
      method: 'GET'
    });
  },

  // 获取课程学生列表
  getCourseStudents: async (courseId) => {
    return request(`/courses/${courseId}/students`, {
      method: 'GET'
    });
  },

  // 获取课程教师列表
  getCourseTeachers: async (courseId) => {
    return request(`/courses/${courseId}/teachers`, {
      method: 'GET'
    });
  }
};
