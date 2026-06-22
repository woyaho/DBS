<template>
  <div class="teacher-layout">
    <!-- 顶部导航 -->
    <TeacherHeader />

    <div class="content-container">
      <!-- 侧边栏 -->
      <TeacherSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <div class="forum-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">我的收藏</h1>
              <button class="btn-primary new-post-btn" @click="goToForum">返回论坛</button>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>

            <!-- 错误提示 -->
            <div v-else-if="error" class="error-state">
              <p class="error-message">{{ error }}</p>
              <button class="btn-primary" @click="loadFavorites">重试</button>
            </div>

            <!-- 空状态 -->
            <div v-else-if="favorites.length === 0" class="empty-state">
              <div class="empty-icon">❤️</div>
              <h3>暂无收藏</h3>
              <p>还没有收藏任何帖子，快去论坛看看吧！</p>
              <button class="btn-primary" @click="goToForum">去论坛</button>
            </div>

            <!-- 收藏列表 -->
            <div class="post-list">
              <div
                v-for="post in favorites"
                :key="post.postId"
                class="post-card"
                @click="goToPostDetail(post.postId)"
              >
                <div class="post-header">
                  <div class="post-title-area">
                    <div class="author-avatar" :style="{ backgroundColor: getAvatarColor(post.authorDisplayName) }">{{ getAvatarInitial(post.authorDisplayName) }}</div>
                    <h3 class="post-title">{{ post.title || '无标题' }}</h3>
                  </div>
                  <div class="post-header-actions">
                    <span v-if="post.essence" class="post-badge essence-badge">精华</span>
                    <span class="post-category">{{ getCategoryName(post.categoryId) }}</span>
                    <button class="action-btn" @click.stop="toggleFavorite(post)" :class="{ active: post.favorite }">
                      {{ post.favorite ? '取消收藏' : '收藏' }}
                    </button>
                  </div>
                </div>
                <div class="post-meta">
                  <span class="post-author">{{ post.authorDisplayName }}</span>
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  <span class="post-views">{{ post.views || 0 }} 浏览</span>
                  <span class="post-replies">{{ post.commentCount || 0 }} 回复</span>
                  <span class="post-favorites">{{ post.favoriteCount || 0 }} 收藏</span>
                </div>
                <p class="post-content">{{ (post.content || '').substring(0, 150) }}...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { forumAPI } from '@/services/api.js'

const router = useRouter()

const favorites = ref([])
const loading = ref(false)
const error = ref('')

// 分类数据
const categories = [
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
]

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

// 生成用户头像颜色
const getAvatarColor = (name) => {
  if (!name) return '#4a90e2'
  const colors = [
    '#4a90e2', '#e53935', '#43a047', '#fb8c00',
    '#8e24aa', '#00acc1', '#ff5252', '#5c6bc0'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// 获取头像首字母
const getAvatarInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载收藏列表
const loadFavorites = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await forumAPI.getMyFavorites()
    if (response && response.data) {
      favorites.value = response.data
    } else {
      favorites.value = []
    }
  } catch (err) {
    console.error('加载收藏失败:', err)
    error.value = '加载收藏失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 切换收藏状态
const toggleFavorite = async (post) => {
  try {
    const response = await forumAPI.favoritePost({
      postId: post.postId
    })

    const postIndex = favorites.value.findIndex(p => p.postId === post.postId)
    if (postIndex !== -1) {
      if (response && response.data) {
        favorites.value[postIndex].favorite = response.data.favorite
        favorites.value[postIndex].favoriteCount = response.data.favoriteCount
        if (!response.data.favorite) {
          favorites.value.splice(postIndex, 1)
        }
      } else {
        favorites.value[postIndex].favorite = !favorites.value[postIndex].favorite
        if (!favorites.value[postIndex].favorite) {
          favorites.value.splice(postIndex, 1)
        }
      }
    }
  } catch (err) {
    console.error('操作收藏失败:', err)
  }
}

// 跳转到帖子详情
const goToPostDetail = (postId) => {
  router.push(`/teacher/forum/post/${postId}`)
}

// 返回论坛
const goToForum = () => {
  router.push('/teacher/forum')
}

// 页面加载时获取收藏列表
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
/* 页面布局 */
.teacher-layout {
  min-height: 100vh;
  background: #F0F2F5;
  display: flex;
  flex-direction: column;
}

/* 内容容器 */
.content-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 主内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 200px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

/* 论坛容器 */
.forum-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.new-post-btn {
  padding: 8px 20px;
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.error-message {
  color: #dc3545;
  margin-bottom: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0 0 16px 0;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: #4a90e2;
  box-shadow: 0 2px 12px rgba(74, 144, 226, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
  flex: 1;
}

.post-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.top-badge {
  background: #dc3545;
  color: white;
}

.essence-badge {
  background: #ffc107;
  color: #1a2a3a;
}

.post-category {
  font-size: 13px;
  color: #6c757d;
  padding: 2px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.action-btn {
  padding: 4px 12px;
  font-size: 13px;
  color: #6c757d;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #4a90e2;
  border-color: #4a90e2;
}

.action-btn.active {
  color: #dc3545;
  border-color: #dc3545;
}

/* 帖子元信息 */
.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6c757d;
}

.post-author {
  font-weight: 500;
  color: #1a2a3a;
}

.post-tags {
  display: flex;
  gap: 6px;
}

.post-tag {
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

/* 帖子内容 */
.post-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 按钮样式 */
.btn-primary {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #3a80d2;
}
</style>