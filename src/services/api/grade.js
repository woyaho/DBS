// 成绩相关API
import { request } from './request';

export const gradeAPI = {
  // 获取成绩列表
  getGrades: async (params) => {
    return request('/grades', {
      method: 'GET',
      params
    });
  },

  // 获取成绩详情
  getGrade: async (gradeId) => {
    return request(`/grades/${gradeId}`, {
      method: 'GET'
    });
  },

  // 创建成绩
  createGrade: async (data) => {
    return request('/grades', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 更新成绩
  updateGrade: async (gradeId, data) => {
    return request(`/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 获取课程成绩列表
  getCourseGrades: async (courseId) => {
    return request(`/courses/${courseId}/grades`, {
      method: 'GET'
    });
  }
};
