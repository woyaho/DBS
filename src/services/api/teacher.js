// 教师端相关API
import { request, uploadRequest } from './request';

export const teacherAPI = {
  // 获取作业列表（教师端和学生端共用接口）
  getAssignmentList: async () => {
    return request('/student/assignment-list', {
      method: 'GET'
    });
  },

  // 获取作业详情（教师端和学生端共用接口）
  getAssignmentDetail: async (assignmentId) => {
    return request(`/student/assignment-detail?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取班级数量统计
  getClassCounts: async () => {
    return request('/teacher/class-counts', {
      method: 'GET'
    });
  },

  // 获取班级学生列表
  getClassStudents: async (teachingClassId) => {
    return request(`/teacher/class-students?teachingClassId=${teachingClassId}`, {
      method: 'GET'
    });
  },

  // 获取待批改作业数量
  getUncheckedHomeworks: async () => {
    return request('/teacher/unchecked-homeworks', {
      method: 'GET'
    });
  },

  // 获取作业提交状态
  getAssignmentStatus: async (assignmentId) => {
    return request(`/teacher/assignment-status?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取未提交作业的学生列表
  getUnsubmittedStudents: async (assignmentId) => {
    return request(`/teacher/unsubmitted-students?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取作业提交列表
  getAssignmentSubmissions: async (assignmentId) => {
    return request(`/teacher/assignment-submissions?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取作业提交详情
  getSubmissionDetail: async (submissionId) => {
    return request(`/teacher/assignment-submission-detail?submissionId=${submissionId}`, {
      method: 'GET'
    });
  },

  // 获取课件列表
  getCoursewareList: async () => {
    return request('/teacher/courseware', {
      method: 'GET'
    });
  },

  // 获取课件详情
  getCourseware: async (coursewareId) => {
    return request(`/teacher/courseware?coursewareId=${coursewareId}`, {
      method: 'GET'
    });
  },

  // 上传课件
  uploadCourseware: async (file, fileName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', fileName);
    return uploadRequest('/teacher/upload-courseware', formData);
  },

  // AI批改作业
  aiGradeAssignment: async (assignmentId, publishToStudent) => {
    return request(`/teacher/ai-grade-assignment?assignmentId=${assignmentId}&publishToStudent=${publishToStudent}`, {
      method: 'POST'
    });
  },

  // 获取AI批改进度
  getAiGradeProgress: async (assignmentId) => {
    return request(`/teacher/ai-grade-progress?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取AI批改结果列表
  getAiResults: async (assignmentId) => {
    return request(`/teacher/ai-results?assignmentId=${assignmentId}`, {
      method: 'GET'
    });
  },

  // 获取AI批改详情
  getAiResultDetail: async (submissionId) => {
    return request(`/teacher/ai-result-detail?submissionId=${submissionId}`, {
      method: 'GET'
    });
  },

  // 发布AI批改结果
  publishAiResults: async (assignmentId) => {
    return request(`/teacher/publish-ai-results?assignmentId=${assignmentId}`, {
      method: 'POST'
    });
  },

  // 导出成绩（返回CSV文件）
  exportGrades: async (assignmentId) => {
    return request(`/teacher/export-grades?assignmentId=${assignmentId}`, {
      method: 'GET',
      responseType: 'blob'
    });
  },

  // 在线预览学生提交
  viewSubmissionPdf: async (submissionId) => {
    const id = String(submissionId)
    return request(`/teacher/view-submission-pdf?submissionId=${id}`, {
      method: 'GET',
      responseType: 'blob'
    });
  },

  // 下载学生提交
  downloadSubmissionPdf: async (submissionId) => {
    const id = String(submissionId)
    return request(`/teacher/download-submission-pdf?submissionId=${id}`, {
      method: 'GET',
      responseType: 'blob'
    });
  },

  // 下载AI报告
  downloadAiReport: async (submissionId, kind) => {
    const id = String(submissionId)
    const response = await request(`/teacher/download-ai-report?submissionId=${id}&kind=${kind}`, {
      method: 'GET',
      responseType: 'blob'
    });
    
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileNameMap = {
      'teacher-report': '教师报告.pdf',
      'student-report': '学生报告.pdf',
      'reference-answer': '参考答案.pdf'
    }
    a.download = fileNameMap[kind] || '报告.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return response
  },

  // 上传参考答案
  uploadAnswer: async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    return uploadRequest('/teacher/upload-answer', formData);
  },

  // 查看参考答案
  viewAssignmentReferenceAnswer: async (assignmentId) => {
    const response = await request(`/teacher/view-assignment-reference-answer?assignmentId=${assignmentId}`, {
      method: 'GET',
      responseType: 'blob'
    });
    
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    return response
  },

  // 下载参考答案
  downloadAssignmentReferenceAnswer: async (assignmentId) => {
    const response = await request(`/teacher/download-assignment-reference-answer?assignmentId=${assignmentId}`, {
      method: 'GET',
      responseType: 'blob'
    });
    
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `作业${assignmentId}参考答案.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return response
  }
};
