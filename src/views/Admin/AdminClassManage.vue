<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <AdminSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <AdminHeader />

      <main class="main-content">
        <div class="page-header">
          <h2>班级管理</h2>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openAddClassModal">
              <span class="btn-icon">➕</span>
              <span>添加班级</span>
            </button>
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索班级名称/班主任" 
              class="form-input"
            />
            <select v-model="teacherFilter" class="form-select">
              <option value="">所有班主任</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}
              </option>
            </select>
            <button class="btn btn-outline" @click="resetFilters">
              重置
            </button>
          </div>
        </div>

        <div class="class-table">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>班级名称</th>
                <th>班主任</th>
                <th>学生人数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="classItem in filteredClasses" :key="classItem.id">
                <td>{{ classItem.id }}</td>
                <td>{{ classItem.name }}</td>
                <td>{{ getTeacherName(classItem.teacherId) }}</td>
                <td>{{ classItem.studentCount }}</td>
                <td>{{ classItem.createdAt }}</td>
                <td class="actions">
                  <button class="action-btn edit" @click="openEditClassModal(classItem)">
                    编辑
                  </button>
                  <button class="action-btn students" @click="manageStudents(classItem)">
                    管理学生
                  </button>
                  <button class="action-btn delete" @click="deleteClass(classItem.id)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 添加班级模态框 -->
        <div class="modal" v-if="showAddModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>添加班级</h3>
              <button class="close-btn" @click="showAddModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addClass">
                <div class="form-group">
                  <label>班级名称</label>
                  <input type="text" v-model="newClass.name" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>班主任</label>
                  <select v-model="newClass.teacherId" required class="form-select">
                    <option value="">请选择班主任</option>
                    <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.name }}
                    </option>
                  </select>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="showAddModal = false">取消</button>
                  <button type="submit" class="btn btn-primary">添加</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 编辑班级模态框 -->
        <div class="modal" v-if="showEditModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>编辑班级</h3>
              <button class="close-btn" @click="showEditModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateClass">
                <div class="form-group">
                  <label>班级名称</label>
                  <input type="text" v-model="editClass.name" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>班主任</label>
                  <select v-model="editClass.teacherId" required class="form-select">
                    <option value="">请选择班主任</option>
                    <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.name }}
                    </option>
                  </select>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="showEditModal = false">取消</button>
                  <button type="submit" class="btn btn-primary">保存</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 管理学生模态框 -->
        <div class="modal" v-if="showStudentModal">
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h3>管理班级学生 - {{ currentClass.name }}</h3>
              <button class="close-btn" @click="showStudentModal = false">×</button>
            </div>
            <div class="modal-body">
              <div class="student-management">
                <div class="student-lists">
                  <div class="available-students">
                    <h4>可用学生</h4>
                    <div class="student-list">
                      <div 
                        v-for="student in availableStudents" 
                        :key="student.id"
                        class="student-item"
                        @click="addStudentToClass(student)"
                      >
                        <span>{{ student.name }} ({{ student.username }})</span>
                        <button class="add-btn">+</button>
                      </div>
                    </div>
                  </div>
                  <div class="class-students">
                    <h4>班级学生</h4>
                    <div class="student-list">
                      <div 
                        v-for="student in classStudents" 
                        :key="student.id"
                        class="student-item"
                        @click="removeStudentFromClass(student)"
                      >
                        <span>{{ student.name }} ({{ student.username }})</span>
                        <button class="remove-btn">-</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="showStudentModal = false">关闭</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'

// 班级数据
const classes = ref([])

// 用户数据
const users = ref([])

// 班级学生关系
const classStudentsMap = ref({})

// 筛选和分页
const searchKeyword = ref('')
const teacherFilter = ref('')

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showStudentModal = ref(false)

// 表单数据
const newClass = ref({
  name: '',
  teacherId: ''
})

const editClass = ref({
  id: '',
  name: '',
  teacherId: ''
})

const currentClass = ref({})
const availableStudents = ref([])
const classStudents = ref([])

// 计算属性
const teachers = computed(() => {
  return users.value.filter(user => user.role === 'teacher')
})

const filteredClasses = computed(() => {
  return classes.value.filter(classItem => {
    const teacherName = getTeacherName(classItem.teacherId)
    const matchesSearch = !searchKeyword.value || 
      classItem.name.includes(searchKeyword.value) ||
      teacherName.includes(searchKeyword.value)
    const matchesTeacher = !teacherFilter.value || classItem.teacherId == teacherFilter.value
    return matchesSearch && matchesTeacher
  })
})

// 方法
const getTeacherName = (teacherId) => {
  const teacher = users.value.find(user => user.id === teacherId)
  return teacher ? teacher.name : '未分配'
}

const resetFilters = () => {
  searchKeyword.value = ''
  teacherFilter.value = ''
}

const openAddClassModal = () => {
  newClass.value = {
    name: '',
    teacherId: ''
  }
  showAddModal.value = true
}

const openEditClassModal = (classItem) => {
  editClass.value = { ...classItem }
  showEditModal.value = true
}

const addClass = () => {
  const newId = Math.max(...classes.value.map(c => c.id)) + 1
  classes.value.push({
    id: newId,
    ...newClass.value,
    studentCount: 0,
    createdAt: new Date().toLocaleString()
  })
  classStudentsMap.value[newId] = []
  showAddModal.value = false
  alert('班级添加成功')
}

const updateClass = () => {
  const index = classes.value.findIndex(c => c.id === editClass.value.id)
  if (index !== -1) {
    classes.value[index] = { ...editClass.value }
    showEditModal.value = false
    alert('班级更新成功')
  }
}

const deleteClass = (id) => {
  if (confirm('确定要删除这个班级吗？')) {
    classes.value = classes.value.filter(c => c.id !== id)
    delete classStudentsMap.value[id]
    alert('班级删除成功')
  }
}

const manageStudents = (classItem) => {
  currentClass.value = classItem
  
  // 获取可用学生（未分配到其他班级的学生）
  const allStudentIds = users.value.filter(user => user.role === 'student').map(user => user.id)
  const assignedStudentIds = Object.values(classStudentsMap.value).flat()
  const availableStudentIds = allStudentIds.filter(id => !assignedStudentIds.includes(id) || classStudentsMap.value[classItem.id].includes(id))
  
  availableStudents.value = users.value.filter(user => 
    user.role === 'student' && availableStudentIds.includes(user.id) && !classStudentsMap.value[classItem.id].includes(user.id)
  )
  
  classStudents.value = users.value.filter(user => 
    user.role === 'student' && classStudentsMap.value[classItem.id].includes(user.id)
  )
  
  showStudentModal.value = true
}

const addStudentToClass = (student) => {
  if (!classStudentsMap.value[currentClass.value.id]) {
    classStudentsMap.value[currentClass.value.id] = []
  }
  
  if (!classStudentsMap.value[currentClass.value.id].includes(student.id)) {
    classStudentsMap.value[currentClass.value.id].push(student.id)
    
    // 更新学生列表
    availableStudents.value = availableStudents.value.filter(s => s.id !== student.id)
    classStudents.value.push(student)
    
    // 更新班级学生数
    const classIndex = classes.value.findIndex(c => c.id === currentClass.value.id)
    if (classIndex !== -1) {
      classes.value[classIndex].studentCount = classStudentsMap.value[currentClass.value.id].length
    }
  }
}

const removeStudentFromClass = (student) => {
  if (classStudentsMap.value[currentClass.value.id]) {
    classStudentsMap.value[currentClass.value.id] = classStudentsMap.value[currentClass.value.id].filter(id => id !== student.id)
    
    // 更新学生列表
    classStudents.value = classStudents.value.filter(s => s.id !== student.id)
    availableStudents.value.push(student)
    
    // 更新班级学生数
    const classIndex = classes.value.findIndex(c => c.id === currentClass.value.id)
    if (classIndex !== -1) {
      classes.value[classIndex].studentCount = classStudentsMap.value[currentClass.value.id].length
    }
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* 主内容区 */
.content-area {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a2a3a;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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
}

.btn-secondary {
  background: #f5f9ff;
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.btn-secondary:hover {
  background: #e3f2fd;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f7fa;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.form-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-select {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.class-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #1a2a3a;
  font-size: 14px;
}

.table tr:hover {
  background: #f5f9ff;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: #f5f9ff;
  color: #4a90e2;
}

.action-btn.edit:hover {
  background: #e3f2fd;
}

.action-btn.students {
  background: #e8f5e8;
  color: #4caf50;
}

.action-btn.students:hover {
  background: #c8e6c9;
}

.action-btn.delete {
  background: #ffebee;
  color: #f44336;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: #f5f7fa;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1a2a3a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.student-management {
  width: 100%;
}

.student-lists {
  display: flex;
  gap: 24px;
  height: 400px;
}

.available-students,
.class-students {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.available-students h4,
.class-students h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3a;
}

.student-list {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
  background: #f9f9f9;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.3s ease;
}

.student-item:hover {
  background: #f0f0f0;
}

.student-item:last-child {
  border-bottom: none;
}

.add-btn,
.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn {
  background: #4caf50;
  color: white;
}

.add-btn:hover {
  background: #45a049;
  transform: scale(1.1);
}

.remove-btn {
  background: #f44336;
  color: white;
}

.remove-btn:hover {
  background: #da190b;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .form-input,
  .form-select {
    width: 100%;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 12px;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }

  .student-lists {
    flex-direction: column;
    height: 600px;
  }

  .available-students,
  .class-students {
    flex: 1;
  }
}
</style>