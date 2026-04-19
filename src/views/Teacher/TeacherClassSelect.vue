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

          <div class="class-grid">
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

          <div v-if="teacherClasses.length === 0" class="empty-state">
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

const router = useRouter()
const teacherClasses = ref([])

const classes = [
  { id: 1, name: '高一(1)班', teacherId: 2, studentCount: 30, createdAt: '2024-01-01 00:00:00' },
  { id: 2, name: '高一(2)班', teacherId: 2, studentCount: 28, createdAt: '2024-01-02 00:00:00' },
  { id: 3, name: '高二(1)班', teacherId: 5, studentCount: 32, createdAt: '2024-01-03 00:00:00' }
]

const users = [
  { id: 1, username: 'admin', name: '系统管理员', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01 00:00:00' },
  { id: 2, username: 'teacher1', name: '张老师', email: 'teacher1@example.com', role: 'teacher', status: 'active', createdAt: '2024-01-02 00:00:00' },
  { id: 3, username: 'student1', name: '李学生', email: 'student1@example.com', role: 'student', status: 'active', createdAt: '2024-01-03 00:00:00' },
  { id: 4, username: 'student2', name: '王学生', email: 'student2@example.com', role: 'student', status: 'inactive', createdAt: '2024-01-04 00:00:00' },
  { id: 5, username: 'teacher2', name: '刘老师', email: 'teacher2@example.com', role: 'teacher', status: 'active', createdAt: '2024-01-05 00:00:00' }
]

const selectClass = (classItem) => {
  localStorage.setItem('selectedClass', JSON.stringify(classItem))
  router.push('/teacher/homework')
}

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    teacherClasses.value = classes.filter(classItem => classItem.teacherId === userData.id)
  }
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
}
</style>