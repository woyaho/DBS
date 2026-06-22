// 智能组卷相关API
import { request } from './request';

export const smartPaperAPI = {
  // 获取章节列表（根据用户角色自动选择接口）
  getChapters: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role === 'teacher' ? 'teacher' : 'student';
    console.log(`[smartPaperAPI] 获取章节列表，角色: ${role}`);
    return request(`/${role}/smart-paper/chapters`, {
      method: 'GET'
    });
  },

  // 生成试卷（根据用户角色自动选择接口）
  generatePaper: async (data) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role === 'teacher' ? 'teacher' : 'student';
    console.log(`[smartPaperAPI] 生成试卷，角色: ${role}`);
    return request(`/${role}/smart-paper/generate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取试卷列表（教师端）
  getTeacherPaperList: async () => {
    return request('/teacher/smart-paper/list', {
      method: 'GET'
    });
  },

  // 获取试卷列表（学生端）
  getStudentPaperList: async () => {
    return request('/student/smart-paper/list', {
      method: 'GET'
    });
  },

  // 获取组卷详情（教师端）
  getTeacherPaperDetail: async (paperId) => {
    return request(`/teacher/smart-paper/${paperId}`, {
      method: 'GET'
    });
  },

  // 获取组卷详情（学生端 - 用于答题）
  getStudentPaperDetail: async (paperId) => {
    return request(`/student/smart-paper/${paperId}/answering`, {
      method: 'GET'
    });
  },

  // 学生提交试卷
  submitPaper: async (paperId, data) => {
    return request(`/student/smart-paper/${paperId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 学生查看单卷结果
  getPaperResult: async (paperId) => {
    return request(`/student/smart-paper/${paperId}/my-result`, {
      method: 'GET'
    });
  },

  // 学生查看所有试卷结果列表
  getMyResults: async () => {
    return request('/student/smart-paper/my-results', {
      method: 'GET'
    });
  },

  // 获取试卷详情（通用方法，根据用户角色自动选择接口）
  getPaperDetail: async (paperId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'student') {
      return request(`/student/smart-paper/${paperId}/answering`, {
        method: 'GET'
      });
    } else {
      return request(`/teacher/smart-paper/${paperId}`, {
        method: 'GET'
      });
    }
  },

  // 获取试卷列表（通用方法，根据用户角色自动选择接口）
  getPaperList: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'student') {
      return request('/student/smart-paper/list', {
        method: 'GET'
      });
    } else {
      return request('/teacher/smart-paper/list', {
        method: 'GET'
      });
    }
  }
};
