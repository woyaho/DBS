// 管理端相关API
import { request } from './request';
import { uploadRequest } from './request';

export const adminAPI = {
  // 获取反馈列表
  getFeedbacks: async (params) => {
    return request('/admin/feedbacks', {
      method: 'GET',
      params
    });
  },

  // 获取用户统计
  getUserCounts: async () => {
    return request('/admin/user-counts', {
      method: 'GET'
    });
  },

  // 获取班级统计
  getClassCounts: async () => {
    return request('/admin/class-counts', {
      method: 'GET'
    });
  },

  // 创建用户（使用注册接口）
  createUser: async (data) => {
    const postData = {
      username: data.account || data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      phone: data.phone,
      identity: data.identity || 'student'
    };
    return request('/register', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  // 更新用户状态
  updateUserStatus: async (data) => {
    return request('/admin/user/status', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 重置用户密码
  resetUserPassword: async (data) => {
    return request('/admin/user/password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 删除用户
  deleteUser: async (id) => {
    return request('/admin/user', {
      method: 'DELETE',
      params: { id }
    });
  },

  // 获取用户列表
  getUserList: async (params) => {
    return request('/admin/user', {
      method: 'GET',
      params
    });
  },

  // 获取教学班级列表
  getTeachingClasses: async (params) => {
    return request('/admin/teaching-classes', {
      method: 'GET',
      params
    });
  },

  // 创建教学班级
  createTeachingClass: async (data) => {
    return request('/admin/teaching-classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 更新教学班级
  updateTeachingClass: async (data) => {
    return request('/admin/teaching-classes', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除教学班级
  deleteTeachingClass: async (id) => {
    return request(`/admin/teaching-classes?teachingClassId=${id}`, {
      method: 'DELETE'
    });
  },

  // 更新教师授课班级
  updateTeacherClasses: async (teacherUsername, teachingClassIds) => {
    const data = {
      teacherUsername: teacherUsername,
      teachingClassIds: teachingClassIds
    };
    return request('/admin/teacher/teaching-classes', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 获取班级学生列表
  getClassStudents: async (teachingClassId) => {
    return request(`/admin/class-students?teachingClassId=${teachingClassId}`, {
      method: 'GET'
    });
  },

  // 更新学生班级
  updateStudentClass: async (username, teachingClassId) => {
    const data = {
      username: username,
      teachingClassId: teachingClassId
    };
    return request('/admin/user', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 更新用户信息
  updateUserInfo: async (userData) => {
    // 将前端数据格式转换为后端需要的格式
    const data = {
      username: userData.username,
      name: userData.name,
      identity: userData.role || userData.identity
    };

    // 只在有值时才添加可选字段，避免空字符串问题
    if (userData.phone && userData.phone.trim() !== '') {
      data.phone = userData.phone;
    }
    if (userData.email && userData.email.trim() !== '') {
      data.email = userData.email;
    }
    if (userData.idCard && userData.idCard.trim() !== '') {
      data.idCard = userData.idCard;
    }

    console.log('[DEBUG] 更新用户信息请求数据:', JSON.stringify(data, null, 2));

    return request('/admin/user', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 获取作业列表（与学生端、教师端共用接口）
  getAssignmentList: async (params) => {
    return request('/student/assignment-list', {
      method: 'GET',
      params
    });
  },

  // 获取作业详情（与学生端、教师端共用接口）
  getAssignmentDetail: async (assignmentId) => {
    return request(`/student/assignment-detail?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 删除作业
  deleteAssignment: async (assignmentId) => {
    return request(`/admin/assignment?assignmentId=${assignmentId}`, {
      method: 'DELETE'
    });
  },

  // 发布作业（管理端专用）
  publishAssignment: async (formData) => {
    return uploadRequest('/admin/publish-assignment', formData);
  },

  // 批量导入学生作业（管理端专用）
  importAssignmentSubmissions: async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    return uploadRequest('/admin/assignment-submissions/import-zip', formData);
  },

  // 批量注册用户（Excel导入）
  batchRegisterUsers: async (file, identity = 'student', academicYear = 2026) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('identity', identity);
    formData.append('academicYear', academicYear);
    return uploadRequest('/admin/users/batch-register', formData);
  },

  // 下载学生批量导入示例文件
  downloadStudentTemplate: async () => {
    const response = await request('/admin/users/batch-register/student-template', {
      method: 'GET',
      responseType: 'blob'
    });
    return response;
  },

  // 下载教师批量导入示例文件
  downloadTeacherTemplate: async () => {
    const response = await request('/admin/users/batch-register/teacher-template', {
      method: 'GET',
      responseType: 'blob'
    });
    return response;
  },

  // 获取系统日志
  getSystemLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/logs${query ? `?${query}` : ''}`, {
      method: 'GET'
    });
  },

  // 标记反馈已处理
  markFeedbackProcessed: async (feedbackId) => {
    return request(`/admin/feedbacks/processed?feedbackId=${feedbackId}`, {
      method: 'PUT'
    });
  }
};
