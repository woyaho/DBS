// 登录认证相关API
import { request } from './request';

export const authAPI = {
  // 登录
  login: async (data) => {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 登出
  logout: async () => {
    return request('/logout', {
      method: 'POST'
    });
  },

  // 忘记密码
  forgetPassword: async (email) => {
    return request('/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // 重置密码
  resetPassword: async (data) => {
    return request('/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 修改密码（与 resetPassword 相同）
  changePassword: async (data) => {
    return request('/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 刷新token
  refreshToken: async () => {
    return request('/auth/refresh', {
      method: 'POST'
    });
  },

  // 检验当前登录态
  checkAuth: async () => {
    return request('/authentication', {
      method: 'GET'
    });
  },

  // 注册账号
  register: async (data) => {
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
  }
};
