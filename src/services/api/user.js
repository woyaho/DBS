// 用户管理相关API
import { request } from './request';

export const userAPI = {
  // 获取用户列表
  getUsers: async (params) => {
    return request('/users', {
      method: 'GET',
      params
    });
  },

  // 获取用户详情
  getUser: async (userId) => {
    return request(`/users/${userId}`, {
      method: 'GET'
    });
  },

  // 创建用户
  createUser: async (data) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 更新用户
  updateUser: async (userId, data) => {
    return request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除用户
  deleteUser: async (userId) => {
    return request(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return request('/users/me', {
      method: 'GET'
    });
  },

  // 修改密码
  changePassword: async (data) => {
    return request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 用户忘记密码
  forgetPassword: async (data) => {
    return request('/users/forget-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
