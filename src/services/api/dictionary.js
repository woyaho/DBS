// 数据字典相关API
import { request } from './request';

export const dictionaryAPI = {
  // 获取角色列表
  getRoles: async () => {
    return request('/dictionary/roles', {
      method: 'GET'
    });
  },

  // 获取作业难度列表
  getHomeworkDifficulty: async () => {
    return request('/dictionary/homework-difficulty', {
      method: 'GET'
    });
  },

  // 获取课程状态列表
  getCourseStatus: async () => {
    return request('/dictionary/course-status', {
      method: 'GET'
    });
  }
};
