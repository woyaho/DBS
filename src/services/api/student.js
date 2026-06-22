// 学生端相关API
import { request } from './request';

export const studentAPI = {
  // 获取课件列表
  getCoursewareList: async () => {
    return request('/student/courseware', {
      method: 'GET'
    });
  },

  // 获取作业统计
  getAssignmentCounts: async () => {
    console.log('=== 调用 getAssignmentCounts API ===');
    const response = await request('/student/assignment-counts', {
      method: 'GET'
    });
    console.log('=== getAssignmentCounts 响应 ===', response);
    console.log('=== response.data ===', response?.data);
    console.log('=== response.data.completedCount ===', response?.data?.completedCount);
    console.log('=== response.data.uncompletedCount ===', response?.data?.uncompletedCount);
    return response;
  },

  // 获取即将到期的作业
  getUpcomingAssignments: async (days) => {
    return request(`/student/upcoming-assignments?days=${days}`, {
      method: 'GET'
    });
  },

  // 获取已提交作业列表
  getSubmittedAssignments: async () => {
    return request('/student/submitted-assignments', {
      method: 'GET'
    });
  },

  // 获取未提交作业列表
  getUnsubmittedAssignments: async () => {
    return request('/student/unsubmitted-assignments', {
      method: 'GET'
    });
  },

  // 获取我的课程列表
  getMyCourses: async () => {
    return request('/student/my-courses', {
      method: 'GET'
    });
  },

  // 获取我的通知列表
  getMyNotifications: async () => {
    return request('/student/notifications', {
      method: 'GET'
    });
  },

  // 下载课件
  downloadCourseware: async (coursewareId) => {
    return request(`/student/download-courseware?coursewareId=${coursewareId}`, {
      method: 'GET',
      responseType: 'blob'
    });
  },

  // 获取作业列表
  getAssignmentList: async () => {
    console.log('=== 调用 getAssignmentList API ===');
    const response = await request('/student/assignment-list', {
      method: 'GET'
    });
    console.log('=== getAssignmentList 响应 ===', response);
    return response;
  },

  // 获取作业详情
  getAssignmentDetail: async (assignmentId) => {
    console.log('=== 调用 getAssignmentDetail API ===', assignmentId);
    const response = await request(`/student/assignment-detail?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
    console.log('=== getAssignmentDetail 响应 ===', response);
    return response;
  },

  // 获取作业状态
  getAssignmentStatus: async (assignmentId) => {
    console.log('=== 调用 getAssignmentStatus API ===', assignmentId);
    const response = await request(`/student/my-assignment-status?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
    console.log('=== getAssignmentStatus 响应 ===', response);
    return response;
  },

  // 查看作业附件
  viewAssignmentFile: async (fileId) => {
    console.log('=== 调用 viewAssignmentFile API ===', fileId);
    const response = await request(`/student/view-assignment-file?fileId=${fileId}`, {
      method: 'GET',
      responseType: 'blob'
    });
    console.log('=== viewAssignmentFile 响应 ===', response);
    return response;
  },

  // 下载作业附件
  downloadAssignmentFile: async (fileId) => {
    console.log('=== 调用 downloadAssignmentFile API ===', fileId);
    const response = await request(`/student/download-assignment-file?fileId=${fileId}`, {
      method: 'GET',
      responseType: 'blob'
    });
    console.log('=== downloadAssignmentFile 响应 ===', response);
    return response;
  },

  // 提交作业
  submitAssignment: async (data) => {
    console.log('=== 调用 submitAssignment API ===', data);
    const formData = new FormData();
    formData.append('assignmentId', data.assignmentId);
    if (data.text) {
      formData.append('text', data.text);
    }
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    const response = await request('/student/submit-assignment', {
      method: 'POST',
      body: formData
    });
    console.log('=== submitAssignment 响应 ===', response);
    return response;
  },

  // 获取平均成绩
  getAverageScore: async () => {
    console.log('=== 调用 getAverageScore API ===');
    const response = await request('/student/assignment-average-score', {
      method: 'GET'
    });
    console.log('=== getAverageScore 响应 ===', response);
    return response;
  },

  // 获取最近成绩（最近3个作业成绩）
  getRecentGrades: async () => {
    console.log('=== 调用 getRecentGrades API ===');
    const response = await request('/student/recent-assignment-grades', {
      method: 'GET'
    });
    console.log('=== getRecentGrades 响应 ===', response);
    return response;
  },

  // 查看成绩报告或参考答案
  viewReportFile: async (assignmentId, kind) => {
    console.log('=== 调用 viewReportFile API ===', assignmentId, kind);
    const response = await request(`/student/view-my-assignment-report?assignmentId=${assignmentId}&kind=${kind}`, {
      method: 'GET',
      responseType: 'blob'
    });
    console.log('=== viewReportFile 响应 ===', response);
    
    if (response) {
      const url = window.URL.createObjectURL(response);
      window.open(url, '_blank');
    }
    return response;
  },

  // 下载成绩报告或参考答案
  downloadReportFile: async (assignmentId, kind) => {
    console.log('=== 调用 downloadReportFile API ===', assignmentId, kind);
    const response = await request(`/student/download-my-assignment-report?assignmentId=${assignmentId}&kind=${kind}`, {
      method: 'GET',
      responseType: 'blob'
    });
    console.log('=== downloadReportFile 响应 ===', response);
    
    if (response) {
      const fileName = kind === 'student-report' ? '成绩报告.pdf' : '参考答案.pdf';
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    return response;
  },

  // 获取我提交的作业文件列表
  getMySubmissionFiles: async (assignmentId) => {
    console.log('=== 调用 getMySubmissionFiles API ===', assignmentId);
    const response = await request(`/student/my-assignment-submission-files?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
    console.log('=== getMySubmissionFiles 响应 ===', response);
    return response;
  },

  // 预览我提交的作业
  viewMySubmission: async (assignmentId) => {
    console.log('=== 调用 viewMySubmission API ===', assignmentId);
    const response = await request(`/student/my-assignment-submission-files?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
    console.log('=== viewMySubmission 响应 ===', response);
    
    if (response && response.code === 200 && response.data && response.data.length > 0) {
      const firstFile = response.data[0];
      if (firstFile.downloadUrl) {
        window.open(firstFile.downloadUrl, '_blank');
      }
    }
    return response;
  },

  // 下载我提交的作业
  downloadMySubmission: async (assignmentId) => {
    console.log('=== 调用 downloadMySubmission API ===', assignmentId);
    const response = await request(`/student/my-assignment-submission-files?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
    console.log('=== downloadMySubmission 响应 ===', response);
    
    if (response && response.code === 200 && response.data && response.data.length > 0) {
      const firstFile = response.data[0];
      if (firstFile.downloadUrl) {
        window.location.href = firstFile.downloadUrl;
      }
    }
    return response;
  }
};
