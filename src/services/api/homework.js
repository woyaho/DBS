// 作业相关API
import { request } from './request';

export const homeworkAPI = {
  // 获取作业列表
  getHomeworks: async (params) => {
    return request('/homework', {
      method: 'GET',
      params
    });
  },

  // 创建作业
  createHomework: async (data) => {
    return request('/homework', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取作业详情
  getHomework: async (homeworkId) => {
    return request(`/homework/${homeworkId}`, {
      method: 'GET'
    });
  },

  // 更新作业
  updateHomework: async (homeworkId, data) => {
    return request(`/homework/${homeworkId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除作业
  deleteHomework: async (homeworkId) => {
    return request(`/homework/${homeworkId}`, {
      method: 'DELETE'
    });
  },

  // 获取课程作业列表
  getCourseHomeworks: async (courseId) => {
    return request(`/courses/${courseId}/homework`, {
      method: 'GET'
    });
  },

  // 提交作业
  submitHomework: async (homeworkId, data) => {
    return request(`/homework/${homeworkId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取作业提交列表
  getHomeworkSubmissions: async (homeworkId) => {
    return request(`/homework/${homeworkId}/submissions`, {
      method: 'GET'
    });
  },

  // 获取作业提交详情
  getSubmissionDetail: async (homeworkId, submissionId) => {
    return request(`/homework/${homeworkId}/submissions/${submissionId}`, {
      method: 'GET'
    });
  },

  // 更新作业提交
  updateSubmission: async (homeworkId, submissionId, data) => {
    return request(`/homework/${homeworkId}/submissions/${submissionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
