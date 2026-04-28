<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <StudentHeader />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <StudentSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <div class="forum-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">学习论坛</h1>
              <button class="btn-primary new-post-btn" @click="goToCreatePost">发布新帖子</button>
            </div>

            <!-- 搜索和排序 -->
            <div class="search-sort-bar">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  placeholder="搜索帖子..." 
                  class="search-input"
                  @keyup.enter="handleSearch"
                />
                <button class="search-btn" @click="handleSearch">搜索</button>
              </div>
              <div class="sort-options">
                <select v-model="sortBy" class="sort-select" @change="handleSort">
                  <option value="latest">最新发布</option>
                  <option value="mostViews">最多浏览</option>
                  <option value="mostReplies">最多回复</option>
                </select>
              </div>
            </div>

            <!-- 论坛分类 -->
            <div class="forum-categories">
              <button 
                v-for="category in categories" 
                :key="category.id"
                :class="['category-btn', { active: selectedCategory === category.id }]"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>

            <!-- 错误提示 -->
            <div v-else-if="error" class="error-state">
              <p class="error-message">{{ error }}</p>
              <button class="btn-primary" @click="loadPosts">重试</button>
            </div>

            <!-- 空状态 -->
            <div v-else-if="filteredPosts.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>暂无帖子</h3>
              <p>还没有帖子，快来发布第一个帖子吧！</p>
              <button class="btn-primary" @click="goToCreatePost">发布新帖子</button>
            </div>

            <!-- 帖子列表 -->
            <div class="post-list">
              <div
                v-for="post in filteredPosts"
                :key="post.id"
                class="post-card"
                @click="goToPostDetail(post.id)"
              >
                <div class="post-header">
                  <div class="post-title-area">
                    <div class="author-avatar" :style="{ backgroundColor: getAvatarColor(post.author) }">{{ getAvatarInitial(post.author) }}</div>
                    <h3 class="post-title">{{ post.title || '无标题' }}</h3>
                  </div>
                  <div class="post-header-actions">
                    <span v-if="post.isTop" class="post-badge top-badge">置顶</span>
                    <span v-if="post.isEssence" class="post-badge essence-badge">精华</span>
                    <span class="post-category">{{ getCategoryName(post.categoryId) }}</span>
                    <button class="action-btn" @click.stop="toggleFavorite(post)" :class="{ active: post.isFavorite }">
                      {{ post.isFavorite ? '取消收藏' : '收藏' }}
                    </button>
                  </div>
                </div>
                <div class="post-meta">
                  <span class="post-author">{{ post.author }}</span>
                  <span class="post-date">{{ post.date }}</span>
                  <span class="post-views">{{ post.views }} 浏览</span>
                  <span class="post-replies">{{ post.replies }} 回复</span>
                  <span class="post-tags">
                    <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
                  </span>
                </div>
                <p class="post-content">{{ (post.content || '').substring(0, 150) }}...</p>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
              <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
            </div>


          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { forumAPI } from '@/services/api.js'

const router = useRouter()

// 状态管理
const selectedCategory = ref('all')
const currentPage = ref(1)
const searchKeyword = ref('')
const sortBy = ref('latest')
const loading = ref(false)
const error = ref('')

// 分类数据
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

// 帖子数据
const postsData = ref([])

// 生成用户头像颜色
const getAvatarColor = (author) => {
  const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#417505'];
  if (!author) return colors[0]; // 如果作者为空，返回默认颜色
  const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// 获取用户头像首字母
const getAvatarInitial = (author) => {
  if (!author) return '?'; // 如果作者为空，返回默认字符
  return author.charAt(0).toUpperCase();
};

// 加载帖子数据
const loadPosts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await forumAPI.getPostList({
      page: currentPage.value,
      pageSize: 10,
      search: searchKeyword.value,
      categoryId: selectedCategory.value === 'all' ? '' : selectedCategory.value,
      sort: sortBy.value
    })
    
    console.log('=== loadPosts response ===', response)
    console.log('=== response.data ===', response?.data)
    console.log('=== Array.isArray(response?.data) ===', Array.isArray(response?.data))
    console.log('=== Array.isArray(response?.data?.data) ===', Array.isArray(response?.data?.data))
    
    // 处理后端返回的数据格式
    const data = response.data
    if (data && Array.isArray(data)) {
      // 直接是数组格式
      postsData.value = data.map(post => ({
        id: post.postId,
        title: post.title || '无标题',
        content: post.content || post.body || post.text || '',
        author: post.authorName || post.author || '匿名用户',
        date: post.createTime ? new Date(post.createTime).toLocaleString() : new Date().toLocaleString(),
        views: post.viewCount || post.views || 0,
        replies: post.commentCount || post.replies || 0,
        categoryId: post.categoryId,
        isTop: post.isTop === 1,
        isEssence: post.isEssence === 1,
        isFavorite: false,
        tags: post.tags ? post.tags.split(',') : []
      }))
    } else if (data && data.data && Array.isArray(data.data)) {
      // 嵌套格式 response.data.data
      postsData.value = data.data.map(post => ({
        id: post.postId,
        title: post.title || '无标题',
        content: post.content || post.body || post.text || '',
        author: post.authorName || post.author || '匿名用户',
        date: post.createTime ? new Date(post.createTime).toLocaleString() : new Date().toLocaleString(),
        views: post.viewCount || post.views || 0,
        replies: post.commentCount || post.replies || 0,
        categoryId: post.categoryId,
        isTop: post.isTop === 1,
        isEssence: post.isEssence === 1,
        isFavorite: false,
        tags: post.tags ? post.tags.split(',') : []
      }))
    }
  } catch (err) {
    error.value = '加载帖子失败，请重试'
    console.error('加载帖子失败:', err)
  } finally {
    loading.value = false
  }
}

// 过滤后的帖子
const filteredPosts = computed(() => {
  return postsData.value
})

// 总页数
const totalPages = computed(() => {
  // 实际项目中应该从API返回的分页信息中获取
  return Math.ceil(postsData.value.length / 10)
})

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
  loadPosts()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

// 处理排序
const handleSort = () => {
  currentPage.value = 1
  loadPosts()
}

// 切换收藏状态
const toggleFavorite = async (post) => {
  try {
    if (post.isFavorite) {
      await forumAPI.removeFavorite({
        postId: post.id
      })
    } else {
      await forumAPI.addFavorite({
        postId: post.id
      })
    }
    
    const postIndex = postsData.value.findIndex(p => p.id === post.id)
    if (postIndex !== -1) {
      postsData.value[postIndex].isFavorite = !postsData.value[postIndex].isFavorite
    }
  } catch (err) {
    console.error('操作收藏失败:', err)
  }
}

// 跳转到发布帖子页面
const goToCreatePost = () => {
  router.push('/student/forum/create')
}

// 跳转到帖子详情页面
const goToPostDetail = (postId) => {
  router.push(`/student/forum/post/${postId}`)
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知'
}

// 初始加载
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
/* 页面布局 */
.page-layout {
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
  margin-left: 200px;
  width: calc(100% - 200px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

.forum-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.new-post-btn {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.new-post-btn:hover {
  background: #357abd;
}

/* 搜索和排序栏 */
.search-sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-btn {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #357abd;
}

.sort-options {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 论坛分类 */
.forum-categories {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 14px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.category-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
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
  flex: 1;
  margin-right: 16px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
  flex: 1;
}

.post-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.top-badge {
  background: #f44336;
  color: white;
}

.essence-badge {
  background: #ff9800;
  color: white;
}

.post-category {
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.action-btn {
  padding: 4px 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.action-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.post-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6c757d;
  flex-wrap: wrap;
}

.post-tags {
  display: flex;
  gap: 6px;
  align-items: center;
}

.post-tag {
  padding: 2px 8px;
  background: #f1f3f4;
  color: #5f6368;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.post-content {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.page-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #4a90e2;
  color: #4a90e2;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalFadeIn 0.2s ease;
}

.post-detail-modal {
  max-width: 800px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a2a3a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #adb5bd;
  line-height: 1;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 24px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-textarea {
  resize: vertical;
}

/* 标签输入区域 */
.tag-input-area {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  min-height: 40px;
  transition: all 0.3s;
}

.tag-input-area:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
}

.tag-remove {
  background: none;
  border: none;
  color: #1976d2;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  color: #1565c0;
}

.tag-input-box {
  display: flex;
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
}

/* 富文本编辑器 */
.rich-editor {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.rich-editor:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.toolbar-btn {
  padding: 6px 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.toolbar-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f0f7ff;
}

.rich-textarea {
  border: none;
  border-radius: 0;
  resize: vertical;
  min-height: 200px;
}

.rich-textarea:focus {
  outline: none;
  box-shadow: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

/* 帖子详情样式 */
.post-detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6c757d;
}

.post-detail-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.replies-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 16px;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.reply-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6c757d;
  align-items: center;
}

.reply-action-btn {
  margin-left: auto;
  padding: 2px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-action-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.reply-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.reply-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.reply-btn:hover {
  background: #357abd;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

.loading-state p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fff5f5;
  border-radius: 12px;
  border: 1px solid #ffebee;
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-bottom: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dee2e6;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .new-post-btn {
    width: 100%;
    text-align: center;
  }

  .search-sort-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .forum-categories {
    flex-wrap: wrap;
  }

  .category-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .post-title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .author-avatar {
    align-self: flex-start;
  }

  .post-header-actions {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    text-align: center;
  }

  .post-category {
    align-self: flex-start;
  }

  .post-meta {
    flex-wrap: wrap;
    gap: 12px;
  }

  .post-tags {
    width: 100%;
    flex-wrap: wrap;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .modal-body {
    padding: 16px;
  }

  .editor-toolbar {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .rich-textarea {
    min-height: 150px;
  }

  .tag-input-area {
    min-height: 60px;
  }

  .reply-header {
    flex-wrap: wrap;
  }

  .reply-action-btn {
    margin-left: 0;
    margin-top: 4px;
  }
}
</style>