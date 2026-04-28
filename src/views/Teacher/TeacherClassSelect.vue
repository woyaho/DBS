<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />
    
    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <div class="content-wrapper">
          <div class="page-header">
            <h2>班级选择</h2>
            <p class="page-description">请选择您要管理的班级</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载班级数据中...</p>
          </div>

          <!-- 错误提示 -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="loadClassCounts">重试</button>
          </div>

          <!-- 班级列表 -->
          <div v-else class="class-grid">
            <div 
              v-for="classItem in teacherClasses" 
              :key="classItem.id"
              class="class-card"
              @click="selectClass(classItem)"
            >
              <div class="class-header">
                <h3 class="class-name">{{ classItem.name }}</h3>
                <div class="class-info">
                  <span class="student-count">{{ classItem.studentCount }} 名学生</span>
                </div>
              </div>
              <div class="class-actions">
                <button class="btn btn-primary" @click.stop="selectClass(classItem)">
                  进入班级
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && !error && teacherClasses.length === 0" class="empty-state">
            <div class="empty-icon">🏫</div>
            <h3>暂无班级</h3>
            <p>请联系管理员为您分配班级</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import { teacherAPI } from '@/services/api.js'

const router = useRouter()
const teacherClasses = ref([])
const loading = ref(false)
const error = ref('')

const selectClass = (classItem) => {
  localStorage.setItem('selectedClass', JSON.stringify(classItem))
  router.push('/teacher/homework')
}

const loadClassCounts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await teacherAPI.getClassCounts()
    if (response.data && Array.isArray(response.data)) {
      teacherClasses.value = response.data
    }
  } catch (err) {
    error.value = '加载班级数据失败，请重试'
    console.error('加载班级数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClassCounts()
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #f5f7fa;
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
  margin-left: 200px;
  width: calc(100% - 200px);
}

.content-wrapper {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.class-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #4a90e2;
}

.class-header {
  margin-bottom: 24px;
}

.class-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
}

.class-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.class-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: #fff5f5;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #d32f2f;
}

.error-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .content-wrapper {
    padding: 16px;
  }

  .class-grid {
    grid-template-columns: 1fr;
  }

  .class-card {
    padding: 20px;
  }

  .loading-state,
  .error-state {
    padding: 48px 16px;
  }
}
</style>