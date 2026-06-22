// 统计相关API
import { request } from './request';

export const statisticsAPI = {
  // 获取课程统计
  getCourseStatistics: async (courseId) => {
    return request(`/statistics/course/${courseId}`, {
      method: 'GET'
    });
  },

  // 获取作业统计
  getHomeworkStatistics: async (homeworkId) => {
    return request(`/statistics/homework/${homeworkId}`, {
      method: 'GET'
    });
  },

  // 获取用户统计
  getUserStatistics: async (userId) => {
    return request(`/statistics/user/${userId}`, {
      method: 'GET'
    });
  }
};
