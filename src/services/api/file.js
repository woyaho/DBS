// 文件管理相关API
import { request, uploadRequest } from './request';

export const fileAPI = {
  // 获取文件详情
  getFile: async (fileId) => {
    return request(`/files/${fileId}`, {
      method: 'GET'
    });
  },

  // 上传文件
  uploadFile: async (formData) => {
    return uploadRequest('/files', formData);
  }
};
