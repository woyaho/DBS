<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <StudentSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <StudentHeader />

      <!-- 面包屑导航 -->
      <Breadcrumb />

      <main class="main-content">
        <div class="post-detail-container">
          <!-- 页面标题 -->
          <div class="page-header">
            <h1 class="page-title">{{ post?.title || '帖子详情' }}</h1>
            <button class="btn-secondary back-btn" @click="goBack">返回论坛</button>
          </div>

          <!-- 帖子内容 -->
          <div v-if="post" class="post-detail-card">
            <div class="post-header">
              <div class="post-title-area">
                <div class="author-avatar" :style="{ backgroundColor: getAvatarColor(post.author) }">{{ getAvatarInitial(post.author) }}</div>
                <div>
                  <h2 class="post-title">{{ post.title }}</h2>
                  <div class="post-meta">
                    <span class="post-author">{{ post.author }}</span>
                    <span class="post-date">{{ post.date }}</span>
                    <span class="post-views">{{ post.views }} 浏览</span>
                    <span class="post-replies">{{ post.replies }} 回复</span>
                  </div>
                </div>
              </div>
              <div class="post-header-actions">
                <span v-if="post.isTop" class="post-badge top-badge">置顶</span>
                <span v-if="post.isEssence" class="post-badge essence-badge">精华</span>
                <span class="post-category">{{ getCategoryName(post.categoryId) }}</span>
                <div class="post-actions">
                  <button class="action-btn" @click="toggleFavorite(post)" :class="{ active: post.isFavorite }">
                    {{ post.isFavorite ? '取消收藏' : '收藏' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 帖子标签 -->
            <div class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
            </div>

            <!-- 帖子内容 -->
            <div class="post-content" v-html="post.content"></div>
          </div>

          <!-- 回复区域 -->
          <div v-if="post" class="replies-section">
            <h3 class="replies-title">回复 ({{ post.replies }})</h3>
            <div class="reply-list">
              <div v-for="(reply, index) in post.replyList" :key="index" class="reply-item">
                <div class="reply-header">
                  <div class="author-avatar small" :style="{ backgroundColor: getAvatarColor(reply.author) }">{{ getAvatarInitial(reply.author) }}</div>
                  <div class="reply-meta">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-date">{{ reply.date }}</span>
                  </div>
                  <button class="reply-action-btn" @click="quoteReply(reply)" title="引用回复">
                    引用
                  </button>
                </div>
                <div class="reply-content" v-html="reply.content"></div>
              </div>
            </div>

            <!-- 回复表单 -->
            <div class="reply-form">
              <h4 class="form-title">发表回复</h4>
              <div class="rich-editor">
                <!-- 编辑器工具栏 -->
                <div class="editor-toolbar">
                  <!-- 撤销/重做 -->
                  <button class="toolbar-btn" @click="execCommand('undo')" title="撤销">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                  </button>
                  <button class="toolbar-btn" @click="execCommand('redo')" title="重做">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
                  </button>
                  <div class="toolbar-divider"></div>
                  <!-- 字号 -->
                  <select class="toolbar-select" @change="execCommand('fontSize', $event.target.value); $event.target.value = ''" title="字号">
                    <option value="">默认字号</option>
                    <option value="1">小</option>
                    <option value="2">正常</option>
                    <option value="3">大</option>
                    <option value="4">特大</option>
                    <option value="5">极大</option>
                  </select>
                  <!-- 字体 -->
                  <select class="toolbar-select" @change="execCommand('fontName', $event.target.value); $event.target.value = ''" title="字体">
                    <option value="">默认字体</option>
                    <option value="SimSun">宋体</option>
                    <option value="SimHei">黑体</option>
                    <option value="Microsoft YaHei">微软雅黑</option>
                    <option value="KaiTi">楷体</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                  <div class="toolbar-divider"></div>
                  <!-- 格式按钮 -->
                  <button class="toolbar-btn" @click="execCommand('bold')" title="粗体">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
                  </button>
                  <button class="toolbar-btn" @click="execCommand('italic')" title="斜体">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
                  </button>
                  <button class="toolbar-btn" @click="execCommand('underline')" title="下划线">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
                  </button>
                  <button class="toolbar-btn" @click="execCommand('strikeThrough')" title="删除线">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17.75 9L14 4.5l-1.08 1.09L12.11 4H20c1.1 0 2 .89 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.11.9-2 2-2h2.5l1.79 1.79L9 4.5 5.25 9h12.5zM10 13c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1.5c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1V13z"/></svg>
                  </button>
                  <div class="toolbar-divider"></div>
                  <!-- 列表 -->
                  <button class="toolbar-btn" @click="execCommand('insertUnorderedList')" title="无序列表">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
                  </button>
                  <button class="toolbar-btn" @click="execCommand('insertOrderedList')" title="有序列表">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
                  </button>
                  <div class="toolbar-divider"></div>
                  <!-- 字体颜色 -->
                  <div class="toolbar-color-wrapper">
                    <button class="toolbar-btn" title="字体颜色">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                    </button>
                    <input type="color" class="toolbar-color-picker" @change="execCommand('foreColor', $event.target.value)" title="选择字体颜色">
                  </div>
                  <!-- 链接 -->
                  <button class="toolbar-btn" @click="insertLink" title="插入链接">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                  </button>
                  <!-- 图片 -->
                  <button class="toolbar-btn" @click="triggerImageUpload" title="上传图片">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </button>
                  <input type="file" ref="imageInput" style="display: none" accept="image/*" @change="handleImageUpload">
                  <!-- 公式 -->
                  <button class="toolbar-btn" @click="insertFormula" title="插入公式">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                  </button>
                  <!-- 代码块 -->
                  <button class="toolbar-btn" @click="insertCodeBlock" title="插入代码块">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
                  </button>
                  <!-- OCR -->
                  <button class="toolbar-btn ocr-btn" @click="triggerOCR" title="OCR识别">
                    <span>OCR</span>
                  </button>
                  <input type="file" ref="ocrInput" style="display: none" accept="image/*" @change="handleOCR">
                </div>
                <!-- 编辑区域 -->
                <div ref="replyEditor" class="editor-content" contenteditable="true" @input="updateReplyContent" placeholder="写下你的回复..."></div>
              </div>
              <div class="form-actions">
                <div class="anonymous-option">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="isAnonymous" class="checkbox-input">
                    <span class="checkbox-text">匿名回复</span>
                  </label>
                </div>
                <button class="btn-primary reply-btn" @click="submitReply">发表回复</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const postId = computed(() => parseInt(route.params.id))

// 状态管理
const post = ref(null)
const newReply = ref('')
const isAnonymous = ref(false)

// 图片输入引用
const imageInput = ref(null)
const ocrInput = ref(null)
const replyEditor = ref(null)

// 分类数据
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

// 帖子数据（模拟）
const postsData = ref([
  {
    id: 1,
    title: 'PostgreSQL 与 MySQL 的性能对比分析',
    content: '最近在项目中需要选择数据库，对 PostgreSQL 和 MySQL 进行了一些性能测试。测试场景包括：1. 大量数据的插入性能 2. 复杂查询的执行速度 3. 并发处理能力 4. 索引优化效果...',
    author: '数据库爱好者',
    date: '2025-03-20',
    views: 328,
    replies: 15,
    categoryId: 'performance',
    tags: ['性能测试', '数据库对比'],
    isTop: true,
    isEssence: true,
    isFavorite: false,
    replyList: [
      {
        author: 'SQL达人',
        date: '2025-03-21',
        content: '感谢分享！我也做过类似的测试，PostgreSQL 在复杂查询和事务处理方面确实表现更好。'
      },
      {
        author: '数据库新手',
        date: '2025-03-22',
        content: '请问测试环境是怎样的？硬件配置如何？'
      }
    ]
  },
  {
    id: 2,
    title: 'SQL 优化技巧分享',
    content: '在编写 SQL 查询时，有一些常见的优化技巧可以显著提高查询性能：1. 合理使用索引 2. 避免 SELECT * 3. 使用 JOIN 替代子查询 4. 适当使用视图和存储过程...',
    author: 'SQL专家',
    date: '2025-03-18',
    views: 512,
    replies: 23,
    categoryId: 'sql',
    tags: ['SQL优化', '性能调优'],
    isTop: false,
    isEssence: true,
    isFavorite: false,
    replyList: [
      {
        author: '数据库学习者',
        date: '2025-03-19',
        content: '非常实用的技巧，特别是关于索引的使用部分，收获很大！'
      }
    ]
  },
  {
    id: 3,
    title: '数据库事务隔离级别详解',
    content: '事务隔离级别是数据库并发控制的重要概念，不同的隔离级别会影响数据一致性和并发性能。本文详细介绍了 SQL 标准中的四种隔离级别：读未提交、读已提交、可重复读和串行化...',
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
  },
  {
    id: 4,
    title: '数据库连接池配置最佳实践',
    content: '连接池是提高数据库性能的重要手段，但配置不当会导致性能问题。本文分享连接池配置的最佳实践，包括：1. 连接池大小的设置 2. 连接超时时间的配置 3. 连接验证机制...',
    author: '系统架构师',
    date: '2025-03-10',
    views: 289,
    replies: 12,
    categoryId: 'performance',
    tags: ['连接池', '性能优化'],
    isTop: false,
    isEssence: false,
    isFavorite: false,
    replyList: []
  },
  {
    id: 5,
    title: '如何处理数据库死锁问题',
    content: '死锁是数据库并发操作中常见的问题，本文介绍死锁的产生原因和解决方法：1. 死锁的定义和产生条件 2. 死锁的检测方法 3. 死锁的预防和避免策略...',
    author: '数据库管理员',
    date: '2025-03-05',
    views: 312,
    replies: 16,
    categoryId: 'troubleshooting',
    tags: ['死锁', '并发'],
    isTop: false,
    isEssence: false,
    isFavorite: false,
    replyList: []
  }
])

// 生成用户头像颜色
const getAvatarColor = (author) => {
  const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#417505'];
  const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// 获取用户头像首字母
const getAvatarInitial = (author) => {
  return author.charAt(0).toUpperCase();
};

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知'
}

// 初始化数据
onMounted(() => {
  const foundPost = postsData.value.find(p => p.id === postId.value)
  if (foundPost) {
    post.value = { ...foundPost }
    // 增加浏览量
    const postIndex = postsData.value.findIndex(p => p.id === postId.value)
    if (postIndex !== -1) {
      postsData.value[postIndex].views++
    }
  }
})

// 返回论坛
const goBack = () => {
  router.push('/student/forum')
}

// 切换收藏状态
const toggleFavorite = (post) => {
  const postIndex = postsData.value.findIndex(p => p.id === post.id)
  if (postIndex !== -1) {
    postsData.value[postIndex].isFavorite = !postsData.value[postIndex].isFavorite
    post.isFavorite = !post.isFavorite
  }
}

// 引用回复
const quoteReply = (reply) => {
  const quoteHtml = `<blockquote contenteditable="false" style="border-left: 3px solid #4a90e2; padding-left: 12px; margin: 8px 0; color: #666; background: #f8f9fa; padding: 12px; border-radius: 4px;"><strong>${reply.author}</strong> ${reply.date}:<br>${reply.content}</blockquote><p><br></p>`
  if (replyEditor.value) {
    replyEditor.value.innerHTML += quoteHtml
    newReply.value = replyEditor.value.innerHTML
    replyEditor.value.focus()
  }
}

// 富文本编辑器命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  if (replyEditor.value) {
    replyEditor.value.focus()
  }
}

// 更新回复内容
const updateReplyContent = () => {
  if (replyEditor.value) {
    newReply.value = replyEditor.value.innerHTML
  }
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址：', 'http://')
  if (url) {
    execCommand('createLink', url)
  }
}

// 插入公式
const insertFormula = () => {
  const formula = prompt('请输入公式（LaTeX格式）：', '')
  if (formula) {
    const html = `<span class="formula" style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace;">$${formula}$</span>&nbsp;`
    execCommand('insertHTML', html)
  }
}

// 插入代码块
const insertCodeBlock = () => {
  const code = prompt('请输入代码：', '')
  if (code) {
    const html = `<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre><p><br></p>`
    execCommand('insertHTML', html)
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const imageUrl = URL.createObjectURL(file)
    const html = `<img src="${imageUrl}" style="max-width: 100%; border-radius: 4px; margin: 8px 0;" /><p><br></p>`
    execCommand('insertHTML', html)
    event.target.value = ''
  }
}

// 触发OCR
const triggerOCR = () => {
  if (ocrInput.value) {
    ocrInput.value.click()
  }
}

// 处理OCR（模拟）
const handleOCR = (event) => {
  const file = event.target.files[0]
  if (file) {
    setTimeout(() => {
      const ocrText = '这是OCR识别的文本内容（模拟）...'
      execCommand('insertText', ocrText)
    }, 500)
    event.target.value = ''
  }
}

// 获取学生姓名（模拟）
const getStudentName = () => {
  // 从localStorage获取用户信息
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return userData.name || '学生'
  }
  return '学生'
}

// 提交回复
const submitReply = () => {
  if (!newReply.value) {
    alert('请输入回复内容')
    return
  }
  
  if (post.value) {
    const reply = {
      author: isAnonymous.value ? '匿名用户' : getStudentName(),
      date: new Date().toISOString().split('T')[0],
      content: newReply.value
    }
    
    post.value.replyList.push(reply)
    post.value.replies++
    
    // 更新原始数据
    const postIndex = postsData.value.findIndex(p => p.id === post.value.id)
    if (postIndex !== -1) {
      postsData.value[postIndex].replyList.push(reply)
      postsData.value[postIndex].replies++
    }
    
    // 清空编辑器
    newReply.value = ''
    if (replyEditor.value) {
      replyEditor.value.innerHTML = ''
    }
  }
}
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #F0F2F5;
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

.post-detail-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
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

.back-btn {
  padding: 8px 16px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

/* 帖子详情卡片 */
.post-detail-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.post-title-area {
  display: flex;
  align-items: flex-start;
  flex: 1;
  gap: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.author-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
  flex-wrap: wrap;
}

.post-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
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

.post-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
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

/* 帖子标签 */
.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.post-tag {
  padding: 4px 12px;
  background: #f1f3f4;
  color: #5f6368;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 帖子内容 */
.post-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.post-content img {
  max-width: 100%;
  border-radius: 4px;
}

.post-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 富文本编辑器 */
.rich-editor {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.rich-editor:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  min-width: 32px;
  height: 32px;
}

.toolbar-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f0f7ff;
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 4px;
}

.toolbar-select {
  padding: 4px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  height: 32px;
}

.toolbar-select:focus {
  outline: none;
  border-color: #4a90e2;
}

.toolbar-color-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toolbar-color-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.ocr-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
}

.editor-content {
  min-height: 150px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #adb5bd;
  pointer-events: none;
}

.editor-content img {
  max-width: 100%;
  border-radius: 4px;
}

.editor-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.reply-content img {
  max-width: 100%;
  border-radius: 4px;
}

.reply-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.reply-content blockquote {
  border-left: 3px solid #4a90e2;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
}

/* 回复区域 */
.replies-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.replies-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 20px 0;
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
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reply-meta {
  flex: 1;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.reply-action-btn {
  padding: 4px 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
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
  margin: 0;
}

/* 回复表单 */
.reply-form {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 16px 0;
}

.reply-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;
}

.reply-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.anonymous-option {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4a90e2;
}

.checkbox-text {
  font-size: 14px;
  color: #495057;
}

.reply-btn {
  padding: 10px 20px;
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
  
  .back-btn {
    align-self: stretch;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .post-title-area {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .author-avatar {
    align-self: flex-start;
  }
  
  .post-header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .post-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    text-align: center;
  }
  
  .post-meta {
    flex-wrap: wrap;
  }
  
  .post-tags {
    width: 100%;
  }
  
  .reply-header {
    flex-wrap: wrap;
  }
  
  .reply-action-btn {
    margin-left: auto;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .anonymous-option {
    order: 2;
  }
  
  .editor-toolbar {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding: 8px;
  }
  
  .toolbar-select {
    font-size: 12px;
    padding: 4px;
  }
  
  .editor-content {
    min-height: 120px;
  }
}
</style>