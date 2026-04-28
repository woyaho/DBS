// API服务文件，封装所有后端API调用

// 开发环境使用相对路径，通过Vite代理转发
// 生产环境应配置为实际的后端地址
const API_BASE_URL = '/api';

// 通用请求函数
async function request(url, options = {}) {
  // 构建headers
  const headers = {};

  // 添加认证Token（如果存在）
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 如果不是FormData和URLSearchParams，设置Content-Type
  // FormData请求不需要设置Content-Type，浏览器会自动设置multipart/form-data边界
  // URLSearchParams请求浏览器会自动设置application/x-www-form-urlencoded
  if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }

  // 处理GET请求的查询参数
  let finalUrl = url;
  if (options.method === 'GET' && options.params) {
    const searchParams = new URLSearchParams(options.params);
    finalUrl = `${url}?${searchParams.toString()}`;
  }

  const response = await fetch(`${API_BASE_URL}${finalUrl}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    credentials: 'include',  // 携带Cookie（Session认证需要）
    mode: 'cors'  // 启用CORS
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

// 通用文件上传请求函数
async function uploadRequest(url, formData) {
  // 构建headers，添加认证Token（如果存在）
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    body: formData,
    headers: headers,
    credentials: 'include'  // 携带Cookie（Session认证需要）
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

// 认证相关API
export const authAPI = {
  // 注册
  register: async (data) => {
    // 登录/注册接口不携带token
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  },

  // 登录 - 修改为JSON格式
  login: async (data) => {
    // 根据API文档，登录接口使用JSON格式
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account: data.account,
        password: data.password,
        identity: data.identity
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  },

  // 退出登录
  logout: async () => {
    return request('/logout', {
      method: 'GET'
    });
  },

  // 检验当前登录态
  checkAuth: async () => {
    return request('/authentication', {
      method: 'GET'
    });
  },

  // 忘记密码
  forgetPassword: async (data) => {
    return request('/forget-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 修改密码
  changePassword: async (data) => {
    return request('/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 学生端API
export const studentAPI = {
  // 查看全部作业列表
  getAssignmentList: async () => {
    return request('/student/assignment-list', {
      method: 'GET'
    });
  },

  // 获取未来days天内截止的作业
  getUpcomingAssignments: async (days = 7) => {
    return request(`/student/upcoming-assignments?days=${days}`, {
      method: 'GET'
    });
  },

  // 获取作业详情
  getAssignmentDetail: async (assignmentId) => {
    return request(`/student/assignment-detail?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 下载作业附件
  downloadAssignmentFile: async (fileId) => {
    window.open(`${API_BASE_URL}/student/download-assignment-file?fileId=${fileId}`, '_blank');
  },

  // 在线浏览作业附件
  viewAssignmentFile: async (fileId) => {
    window.open(`${API_BASE_URL}/student/view-assignment-file?fileId=${fileId}`, '_blank');
  },

  // 提交作业
  submitAssignment: async (data) => {
    const formData = new FormData();
    formData.append('assignmentId', data.assignmentId);
    if (data.text) formData.append('text', data.text);
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    if (data.images) {
      data.images.forEach(file => {
        formData.append('images', file);
      });
    }
    return uploadRequest('/student/submit-assignment', formData);
  },

  // 查看作业状态
  getAssignmentStatus: async (assignmentId) => {
    return request(`/student/my-assignment-status?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 查看作业报告
  getAssignmentReports: async (assignmentId) => {
    return request(`/student/my-assignment-reports?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 下载报告文件
  downloadReportFile: async (assignmentId, kind) => {
    window.open(`${API_BASE_URL}/student/download-my-assignment-report?assignmentId=${assignmentId}&kind=${kind}`, '_blank');
  },

  // 查看报告文件
  viewReportFile: async (assignmentId, kind) => {
    window.open(`${API_BASE_URL}/student/view-my-assignment-report?assignmentId=${assignmentId}&kind=${kind}`, '_blank');
  },

  // 获取课件列表
  getCoursewareList: async () => {
    return request('/student/courseware', {
      method: 'GET'
    });
  },

  // 下载课件
  downloadCourseware: async (coursewareId) => {
    window.open(`${API_BASE_URL}/student/download-courseware?coursewareId=${coursewareId}`, '_blank');
  },

  // 在线预览课件
  viewCourseware: async (coursewareId) => {
    window.open(`${API_BASE_URL}/student/view-courseware?coursewareId=${coursewareId}`, '_blank');
  },

  // 提交反馈
  submitFeedback: async (content) => {
    const formData = new FormData();
    formData.append('content', content);
    return uploadRequest('/student/feedback', formData);
  }
};

// 教师端API
export const teacherAPI = {
  // 获取作业详情
  getAssignmentDetail: async (assignmentId) => {
    return request(`/teacher/assignment-detail?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 发布作业
  publishAssignment: async (data) => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);
    if (data.title) formData.append('title', data.title);
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    return uploadRequest('/teacher/publish-assignment', formData);
  },

  // 查看全部作业列表
  getAssignmentList: async () => {
    return request('/student/assignment-list', {
      method: 'GET'
    });
  },

  // 待批改作业提醒
  getUncheckedHomeworks: async () => {
    return request('/teacher/unchecked-homeworks', {
      method: 'GET'
    });
  },

  // 查看提交状态
  getAssignmentStatus: async (assignmentId) => {
    return request(`/teacher/assignment-status?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 未提交学生名单
  getUnsubmittedStudents: async (assignmentId) => {
    return request(`/teacher/unsubmitted-students?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取某作业提交列表
  getAssignmentSubmissions: async (assignmentId) => {
    return request(`/teacher/assignment-submissions?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取提交详情
  getSubmissionDetail: async (submissionId) => {
    return request(`/teacher/assignment-submission-detail?submissionId=${submissionId}`, {
      method: 'GET'
    });
  },

  // 在线预览学生提交
  viewSubmissionPdf: async (submissionId) => {
    window.open(`${API_BASE_URL}/teacher/view-submission-pdf?submissionId=${submissionId}`, '_blank');
  },

  // 下载学生提交
  downloadSubmissionPdf: async (submissionId) => {
    window.open(`${API_BASE_URL}/teacher/download-submission-pdf?submissionId=${submissionId}`, '_blank');
  },

  // 上传参考答案
  uploadAnswer: async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    return uploadRequest('/teacher/upload-answer', formData);
  },

  // 导出成绩
  exportGrades: async (assignmentId) => {
    window.open(`${API_BASE_URL}/teacher/export-grades?assignmentId=${assignmentId}`, '_blank');
  },

  // 上传课件
  uploadCourseware: async (file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name); // title是必填字段，使用文件名作为默认值
    return uploadRequest('/teacher/upload-courseware', formData);
  },

  // AI一键批改
  aiGradeAssignment: async (assignmentId, publishToStudent = false) => {
    return request(`/teacher/ai-grade-assignment?assignmentId=${assignmentId}&publishToStudent=${publishToStudent}`, {
      method: 'POST'
    });
  },

  // 查看AI批改进度
  getAiGradeProgress: async (assignmentId) => {
    return request(`/teacher/ai-grade-progress?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 查看AI结果列表
  getAiResults: async (assignmentId) => {
    return request(`/teacher/ai-results?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 查看单份结果详情
  getAiResultDetail: async (submissionId) => {
    return request(`/teacher/ai-result-detail?submissionId=${submissionId}`, {
      method: 'GET'
    });
  },

  // 上传修订版报告
  uploadReviewedReport: async (data) => {
    const formData = new FormData();
    formData.append('submissionId', data.submissionId);
    formData.append('finalScore', data.finalScore);
    formData.append('finalGrade', data.finalGrade);
    formData.append('teacherReportPdf', data.teacherReportPdf);
    if (data.studentReportPdf) formData.append('studentReportPdf', data.studentReportPdf);
    if (data.publishToStudent !== undefined) formData.append('publishToStudent', data.publishToStudent);
    return uploadRequest('/teacher/upload-reviewed-report', formData);
  },

  // 查看AI报告文件
  viewAiReport: async (submissionId, kind) => {
    window.open(`${API_BASE_URL}/teacher/view-ai-report?submissionId=${submissionId}&kind=${kind}`, '_blank');
  },

  // 手动批改作业
  gradeAssignment: async (submissionId, grade, annotation) => {
    const formData = new FormData();
    formData.append('submissionId', submissionId);
    formData.append('grade', grade);
    formData.append('annotation', annotation);
    return uploadRequest('/teacher/grade-assignment', formData);
  },

  // 教师一键公布批改结果
  publishAiResults: async (assignmentId) => {
    return request(`/teacher/publish-ai-results?assignmentId=${assignmentId}`, {
      method: 'POST'
    });
  },

  // 教师查看自己授课班级人数
  getClassCounts: async () => {
    return request('/teacher/class-counts', {
      method: 'GET'
    });
  }
};

// 论坛相关API
export const forumAPI = {
  // 发帖
  createPost: async (data) => {
    // 后端期望使用表单参数（application/x-www-form-urlencoded）
    const formParams = new URLSearchParams();
    if (data instanceof FormData) {
      data.forEach((value, key) => {
        formParams.append(key, value);
      });
    } else {
      Object.keys(data).forEach(key => {
        formParams.append(key, data[key]);
      });
    }
    return request('/student/post/create', {
      method: 'POST',
      body: formParams
    });
  },

  // 获取我的发帖
  getMyPosts: async (params) => {
    return request('/student/post/my', {
      method: 'GET',
      params
    });
  },

  // 编辑帖子
  editPost: async (data) => {
    return request('/student/post/edit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取帖子列表
  getPostList: async (params) => {
    return request('/student/post/list', {
      method: 'GET',
      params
    });
  },

  // 帖子详情
  getPostDetail: async (params) => {
    return request('/student/post/detail', {
      method: 'GET',
      params
    });
  },

  // 搜索帖子
  searchPosts: async (params) => {
    return request('/student/post/search', {
      method: 'GET',
      params
    });
  },

  // 评论
  addComment: async (data) => {
    return request('/student/comment/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 回复评论
  replyComment: async (data) => {
    return request('/student/comment/reply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取评论区
  getComments: async (params) => {
    return request('/student/comment/list', {
      method: 'GET',
      params
    });
  },

  // 收藏帖子
  addFavorite: async (data) => {
    return request('/student/favorite/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 取消收藏
  removeFavorite: async (data) => {
    return request('/student/favorite/remove', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 我的收藏
  getMyFavorites: async (params) => {
    return request('/student/favorite/my', {
      method: 'GET',
      params
    });
  },

  // 消息中心
  getMessages: async (params) => {
    return request('/student/message/list', {
      method: 'GET',
      params
    });
  },

  // 在线预览论坛文件
  viewForumFile: async (fileId) => {
    window.open(`${API_BASE_URL}/student/post/view-file?fileId=${fileId}`, '_blank');
  },

  // 下载预览论坛文件
  downloadForumFile: async (fileId) => {
    window.open(`${API_BASE_URL}/student/post/download-file?fileId=${fileId}`, '_blank');
  }
};

// 管理端API
export const adminAPI = {
  // 查看反馈列表
  getFeedbacks: async () => {
    return request('/admin/feedbacks', {
      method: 'GET'
    });
  },

  // Excel 批量注册账号
  batchRegisterUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest('/admin/users/batch-register', formData);
  },

  // 获取用户列表
  getUserList: async (params) => {
    return request('/admin/user', {
      method: 'GET',
      params
    });
  },

  // 修改用户启用状态
  updateUserStatus: async (userId, status) => {
    return request('/admin/user/status', {
      method: 'POST',
      body: JSON.stringify({ userId, status })
    });
  },

  // 重置用户密码
  resetUserPassword: async (userId) => {
    return request('/admin/user/password', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  // 修改用户信息
  updateUserInfo: async (userData) => {
    return request('/admin/user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // 查看全部教学班人数
  getClassCounts: async () => {
    return request('/admin/class-counts', {
      method: 'GET'
    });
  },

  // 获取教学班列表
  getTeachingClasses: async () => {
    return request('/admin/teaching-classes', {
      method: 'GET'
    });
  },

  // 新增教学班
  createTeachingClass: async (classData) => {
    return request('/admin/teaching-classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  },

  // 修改教学班
  updateTeachingClass: async (classData) => {
    return request('/admin/teaching-classes', {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  },

  // 调整学生所属教学班
  updateStudentClass: async (userId, classId) => {
    return request('/admin/user/teaching-class', {
      method: 'POST',
      body: JSON.stringify({ userId, classId })
    });
  },

  // 调整教师教授教学班
  updateTeacherClasses: async (teacherId, classIds) => {
    return request('/admin/teacher/teaching-classes', {
      method: 'POST',
      body: JSON.stringify({ teacherId, classIds })
    });
  },

  // 获取作业列表
  getAssignmentList: async (status) => {
    return request(`/api/student/assignment-list?status=${status}`, {
      method: 'GET'
    });
  },

  // 发布作业
  publishAssignment: async (data) => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);
    if (data.title) formData.append('title', data.title);
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    return uploadRequest('/admin/publish-assignment', formData);
  },

  // 系统日志查询
  getSystemLogs: async (params) => {
    return request('/admin/logs', {
      method: 'GET',
      params
    });
  }
};
