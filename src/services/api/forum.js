// 论坛相关API
import { request } from './request';

export const forumAPI = {
  // 创建帖子
  createPost: async (data) => {
    return request('/student/post/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取我的帖子
  getMyPosts: async () => {
    return request('/student/post/my', {
      method: 'GET'
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
  getPostList: async (data = {}) => {
    // 后端要求 GET 方法，参数通过 Query 参数传递
    const params = new URLSearchParams(data).toString()
    return request(`/student/post/list${params ? `?${params}` : ''}`, {
      method: 'GET'
    });
  },

  // 获取帖子详情
  getPostDetail: async (data) => {
    // 后端要求 GET 方法，参数通过 Query 参数传递
    const params = new URLSearchParams(data).toString()
    return request(`/student/post/detail?${params}`, {
      method: 'GET'
    });
  },

  // 搜索帖子
  searchPosts: async (data) => {
    // 后端要求 GET 方法，参数通过 Query 参数传递
    const params = new URLSearchParams(data).toString()
    return request(`/student/post/search?${params}`, {
      method: 'GET'
    });
  },

  // 评论帖子
  commentPost: async (data) => {
    return request('/student/post/comment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 回复评论
  replyComment: async (data) => {
    return request('/student/post/reply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 获取帖子评论列表
  getPostComments: async (data) => {
    // 后端要求 GET 方法，参数通过 Query 参数传递
    const params = new URLSearchParams(data).toString()
    return request(`/student/post/comments?${params}`, {
      method: 'GET'
    });
  },

  // 删除帖子
  deletePost: async (data) => {
    return request(`/student/post/delete?postId=${data.postId}`, {
      method: 'POST'
    });
  },

  // 删除评论
  deleteComment: async (data) => {
    return request(`/student/post/comment/delete?commentId=${data.commentId}`, {
      method: 'POST'
    });
  },

  // 收藏帖子
  favoritePost: async (data) => {
    const formData = new FormData();
    formData.append('postId', data.postId);
    console.log('收藏请求参数:', data);
    const response = await request('/student/post/favorite', {
      method: 'POST',
      body: formData
    });
    console.log('收藏响应:', response);
    return response;
  },

  // 获取我的收藏列表
  getMyFavorites: async () => {
    console.log('获取我的收藏列表');
    const response = await request('/student/post/my-favorites', {
      method: 'GET'
    });
    console.log('我的收藏列表响应:', response);
    return response;
  }
};
