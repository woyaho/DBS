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
                    <h3 class="post-title">{{ post.title }}</h3>
                  </div>
                  <div class="post-header-actions">
                    <span v-if="post.isTop" class="post-badge top-badge">置顶</span>
                    <span v-if="post.isEssence" class="post-badge essence-badge">精华</span>
                    <span class="post-category">{{ getCategoryName(post.categoryId) }}</span>
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
                <p class="post-content">{{ post.content.substring(0, 150) }}...</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()

const selectedCategory = ref('all')
const currentPage = ref(1)
const searchKeyword = ref('')
const sortBy = ref('latest')

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

const getAvatarColor = (author) => {
  const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#417505'];
  const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getAvatarInitial = (author) => {
  return author.charAt(0).toUpperCase();
};

const postsData = ref([
  {
    id: 1,
    title: 'PostgreSQL 与 MySQL 的性能对比分析',
    content: '最近在项目中需要选择数据库，对 PostgreSQL 和 MySQL 进行了一些性能测试...',
    author: '数据库爱好者',
    date: '2025-03-20',
    views: 328,
    replies: 15,
    categoryId: 'performance',
    tags: ['性能测试', '数据库对比'],
    isTop: true,
    isEssence: true,
    isFavorite: false,
    replyList: []
  },
  {
    id: 2,
    title: 'SQL 优化技巧分享',
    content: '在编写 SQL 查询时，有一些常见的优化技巧可以显著提高查询性能...',
    author: 'SQL专家',
    date: '2025-03-18',
    views: 512,
    replies: 23,
    categoryId: 'sql',
    tags: ['SQL优化', '性能调优'],
    isTop: false,
    isEssence: true,
    isFavorite: false,
    replyList: []
  },
  {
    id: 3,
    title: '数据库事务隔离级别详解',
    content: '事务隔离级别是数据库并发控制的重要概念...',
    author: '数据库研究员',
    date: '2025-03-15',
    views: 456,
    replies: 18,
    categoryId: 'db-basic',
    tags: ['事务', '隔离级别'],
    isTop: true,
    isEssence: false,
    isFavorite: false,
    replyList: []
  }
])

const filteredPosts = computed(() => {
  let filtered = postsData.value
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(post => post.categoryId === selectedCategory.value)
  }
  
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(keyword) || 
      post.content.toLowerCase().includes(keyword)
    )
  }
  
  const pageSize = 5
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(postsData.value.length / 5)
})

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
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