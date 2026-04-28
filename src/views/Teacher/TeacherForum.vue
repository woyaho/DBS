<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />

    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <Breadcrumb />
        <main class="main-content">
          <div class="forum-container">
            <div class="page-header">
              <h1 class="page-title">学习论坛</h1>
              <button class="btn-primary new-post-btn" @click="goToCreatePost">发布新帖子</button>
            </div>

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
            <div v-else class="post-list">
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
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { forumAPI } from '@/services/api.js'

const router = useRouter()

const selectedCategory = ref('all')
const currentPage = ref(1)
const searchKeyword = ref('')
const sortBy = ref('latest')
const loading = ref(false)
const error = ref('')

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

const postsData = ref([])

const getAvatarColor = (author) => {
  const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#417505'];
  if (!author) return colors[0];
  const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getAvatarInitial = (author) => {
  if (!author) return '?';
  return author.charAt(0).toUpperCase();
};

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

    const data = response.data
    if (data && Array.isArray(data)) {
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

const filteredPosts = computed(() => {
  return postsData.value
})

const totalPages = computed(() => {
  return Math.ceil(postsData.value.length / 10)
})

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
  loadPosts()
}

const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

const handleSort = () => {
  currentPage.value = 1
  loadPosts()
}

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

const goToCreatePost = () => {
  router.push('/teacher/forum/create')
}

const goToPostDetail = (postId) => {
  router.push(`/teacher/forum/post/${postId}`)
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知'
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #F0F2F5;
  display: flex;
  flex-direction: column;
}

.content-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  width: calc(100% - 200px);
}

.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

.forum-container {
  max-width: 100%;
  margin: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
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
}

.search-btn {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  cursor: pointer;
}

.sort-select {
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

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

.category-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

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
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
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
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 24px;
}

.btn-primary {
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

.btn-primary:hover {
  background: #357abd;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
