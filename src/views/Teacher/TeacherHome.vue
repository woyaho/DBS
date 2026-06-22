<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />

    <div class="content-container">
      <!-- 侧边栏 -->
      <TeacherSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>待批改作业</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--warning-color);">{{ pendingCount }}</p>
              <p>份作业待处理</p>
            </div>
            <div class="stat-card">
              <h3>授课班级</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--primary-color);">{{ classList.length }}</p>
              <p>个班级</p>
            </div>
          </div>

          <!-- 授课班级列表 -->
          <div class="card class-list-card">
            <h3>授课班级</h3>
            <div v-if="classList.length > 0" class="class-list">
              <div
                v-for="cls in classList"
                :key="cls.id"
                class="class-item"
                @click="showClassStudents(cls)"
              >
                <div class="class-info">
                  <h4>{{ cls.name }}</h4>
                  <p>{{ cls.studentCount }} 名学生</p>
                </div>
                <button class="btn btn-primary btn-sm">查看名单</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无授课班级</p>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="card">
            <h3>快捷操作</h3>
            <div style="display: flex; gap: 16px; margin-top: 16px;">
              <button class="btn btn-primary" @click="goToHomeworkReview">开始批改作业</button>
              <button class="btn btn-secondary" @click="goToSmartLessonPlan">智能备课助手</button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 班级学生名单弹窗 -->
    <div v-if="showStudentModal" class="modal-overlay student-modal" @click="closeStudentModal">
      <div class="modal-content student-modal-content" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h3>{{ selectedClassName }} - 学生名单</h3>
            <span class="student-count">共 {{ studentList.length }} 名学生</span>
          </div>
          <button class="close-btn" @click="closeStudentModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 搜索框 -->
          <div v-if="studentList.length > 0" class="search-box-container">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" v-model="searchKeyword" @input="updateFilteredStudents" placeholder="搜索学生姓名或学号..." class="search-input" />
            </div>
          </div>

          <div v-if="loadingStudents" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载学生名单中...</p>
          </div>
          <div v-else-if="filteredStudents.length > 0" class="student-list">
            <div class="student-list-header">
              <span class="col-index">#</span>
              <span class="col-avatar">头像</span>
              <span class="col-name">姓名</span>
              <span class="col-id">学号</span>
            </div>
            <div
              v-for="(student, index) in filteredStudents"
              :key="student.id"
              class="student-item"
            >
              <span class="student-index">{{ index + 1 }}</span>
              <div class="student-avatar" :style="{ background: getAvatarColor(student.name) }">
                {{ student.name.charAt(0) }}
              </div>
              <span class="student-name">{{ student.name }}</span>
              <span class="student-id">{{ student.username }}</span>
            </div>
          </div>
          <div v-else-if="!loadingStudents && studentList.length > 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>未找到匹配的学生</p>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <p>该班级暂无学生</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeStudentModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherHome'
}
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { teacherAPI } from '@/services/api.js'

const router = useRouter()
const pendingCount = ref(0)
const classList = ref([])
const studentList = ref([])
const showStudentModal = ref(false)
const selectedClassId = ref(null)
const selectedClassName = ref('')
const loadingStudents = ref(false)
const searchKeyword = ref('')

// 过滤后的学生列表（使用计算属性）
const filteredStudents = ref([])

// 监听搜索关键字变化，更新过滤结果
const updateFilteredStudents = () => {
  if (!searchKeyword.value) {
    filteredStudents.value = studentList.value
  } else {
    const keyword = searchKeyword.value.toLowerCase()
    filteredStudents.value = studentList.value.filter(student =>
      student.name.toLowerCase().includes(keyword) ||
      student.username.toLowerCase().includes(keyword)
    )
  }
}

// 根据姓名生成头像颜色
const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

onMounted(() => {
  loadStatistics()
})

const loadStatistics = async () => {
  try {
    // 并行执行两个独立的API请求，提高加载速度
    const [uncheckedHomeworks, classResponse] = await Promise.all([
      teacherAPI.getUncheckedHomeworks(),
      teacherAPI.getClassCounts()
    ])

    // 处理待批改作业数量
    if (uncheckedHomeworks.code === 200 && uncheckedHomeworks.data) {
      pendingCount.value = uncheckedHomeworks.data.reduce((total, hw) => {
        return total + (hw.ungradedCount || 0)
      }, 0)
    } else {
      pendingCount.value = 0
    }

    // 处理班级列表
    if (classResponse.code === 200 && classResponse.data) {
      classList.value = classResponse.data.map(item => ({
        id: item.id || item.teachingClassId || item.classId || item.teaching_class_id || item.class_id,
        name: item.name || item.displayName || '未命名班级',
        studentCount: item.studentCount || item.count || 0
      }))
    } else {
      classList.value = []
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    console.error('错误详情:', error.message)
    pendingCount.value = 0
    classList.value = []
    // 可以选择显示错误提示给用户
    // alert('加载数据失败，请检查网络连接或稍后重试')
  }
}

const showClassStudents = async (cls) => {
  selectedClassId.value = cls.id
  selectedClassName.value = cls.name
  showStudentModal.value = true
  loadingStudents.value = true
  studentList.value = []
  searchKeyword.value = ''

  console.log('尝试加载班级学生名单, classId:', cls.id, 'className:', cls.name)

  try {
    const response = await teacherAPI.getClassStudents(cls.id)
    console.log('班级学生名单API响应:', response)

    if (response.code === 200 && response.data) {
      studentList.value = response.data.map(item => ({
        id: item.id,
        name: item.name,
        username: item.username
      }))
      console.log('学生列表加载成功, 共', studentList.value.length, '名学生')
    } else {
      studentList.value = []
      console.log('未获取到学生数据')
    }
    // 更新过滤后的学生列表
    updateFilteredStudents()
  } catch (error) {
    console.error('加载学生列表失败:', error)
    studentList.value = []
    alert('加载学生列表失败，请稍后重试')
  } finally {
    loadingStudents.value = false
  }
}

const closeStudentModal = () => {
  showStudentModal.value = false
  studentList.value = []
}

const goToHomeworkReview = () => {
  router.push('/teacher/homework')
}

const goToSmartLessonPlan = () => {
  router.push('/teacher/prepare')
}
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

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-card h3 {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.stat-card p {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

/* 快捷操作卡片 */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 16px;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

/* 班级列表卡片 */
.class-list-card {
  margin-bottom: 24px;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.class-item:hover {
  background: #e9ecef;
}

.class-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.class-info p {
  font-size: 13px;
  color: #6c757d;
  margin: 4px 0 0 0;
}

.btn-sm {
  padding: 6px 16px;
  font-size: 13px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a2a3a;
}

.student-id {
  font-size: 13px;
  color: #6c757d;
}

/* 学生名单弹窗美化样式 */
.student-modal-content {
  max-width: 650px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.student-modal .header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-modal .student-count {
  font-size: 13px;
  color: #6c757d;
  font-weight: 400;
}

.student-modal .search-box-container {
  margin-bottom: 16px;
}

.student-modal .search-box {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.student-modal .search-box:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.student-modal .search-icon {
  font-size: 14px;
  margin-right: 10px;
  color: #adb5bd;
}

.student-modal .search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.student-modal .search-input::placeholder {
  color: #adb5bd;
}

.student-modal .student-list {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.student-modal .student-list-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  font-weight: 600;
  font-size: 13px;
  color: #6c757d;
  border-bottom: 1px solid #e9ecef;
}

.student-modal .student-list-header .col-index {
  width: 40px;
  text-align: center;
}

.student-modal .student-list-header .col-avatar {
  width: 44px;
  text-align: center;
}

.student-modal .student-list-header .col-name {
  flex: 1;
}

.student-modal .student-list-header .col-id {
  width: 120px;
  text-align: right;
}

.student-modal .student-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  justify-content: initial;
  gap: 0;
}

.student-modal .student-item:last-child {
  border-bottom: none;
}

.student-modal .student-item:hover {
  background: #f8f9fa;
}

.student-modal .student-index {
  width: 40px;
  text-align: center;
  font-size: 13px;
  color: #adb5bd;
  font-weight: 500;
}

.student-modal .student-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0 10px;
  flex-shrink: 0;
}

.student-modal .student-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #212529;
}

.student-modal .student-id {
  width: 120px;
  text-align: right;
  font-size: 13px;
  color: #6c757d;
  font-family: monospace;
}

.student-modal .empty-state {
  text-align: center;
  padding: 40px 20px;
}

.student-modal .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.student-modal .empty-state p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card > div {
    flex-direction: column;
  }
}
</style>
