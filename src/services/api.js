// API服务文件，封装所有后端API调用

const API_BASE_URL = 'http://124.222.236.194:8090/spring-api/api';

// 通用请求函数
async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
}

// 通用文件上传请求函数
async function uploadRequest(url, formData) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    body: formData
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
    return request('/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 登录
  login: async (data) => {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
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
    if (title) formData.append('title', title);
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
  }
};