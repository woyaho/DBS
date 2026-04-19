<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />
    
    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <Breadcrumb />
        <main class="main-content">
          <div class="grade-manage-container">
            <h1 class="page-title">成绩管理</h1>

            <!-- 筛选栏 -->
            <div class="filter-section">
              <div class="filter-row">
                <div class="filter-item">
                  <label>作业选择</label>
                  <select v-model="filters.homeworkId" class="select-input">
                    <option value="">全部作业</option>
                    <option v-for="homework in homeworkList" :key="homework.id" :value="homework.id">
                      {{ homework.name }}
                    </option>
                  </select>
                </div>
                <div class="filter-item">
                  <label>班级选择</label>
                  <select v-model="filters.classId" class="select-input">
                    <option value="">全部班级</option>
                    <option v-for="cls in classList" :key="cls.id" :value="cls.id">
                      {{ cls.name }}
                    </option>
                  </select>
                </div>
                <div class="filter-item">
                  <label>是否抄袭</label>
                  <select v-model="filters.plagiarism" class="select-input">
                    <option value="">全部</option>
                    <option value="true">是</option>
                    <option value="false">否</option>
                  </select>
                </div>
                <div class="filter-actions">
                  <button class="btn-primary" @click="searchGrades">搜索</button>
                  <button class="btn-secondary" @click="resetFilters">重置</button>
                  <button class="btn-secondary" @click="exportExcel">导出 Excel</button>
                </div>
              </div>
            </div>

            <!-- 成绩列表表格 -->
            <div class="card">
              <div class="table-responsive">
                <table class="grade-table">
                  <thead>
                    <tr>
                      <th>学号</th>
                      <th>姓名</th>
                      <th>作业名称</th>
                      <th>得分</th>
                      <th>是否抄袭</th>
                      <th>提交时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="grade in filteredGrades" :key="grade.id">
                      <td>{{ grade.studentId }}</td>
                      <td>{{ grade.studentName }}</td>
                      <td>{{ grade.homeworkName }}</td>
                      <td>
                        <span class="score-value" :class="getScoreClass(grade.score)">
                          {{ grade.score }}
                        </span>
                      </td>
                      <td>
                        <span class="plagiarism-tag" :class="grade.plagiarism ? 'yes' : 'no'">
                          {{ grade.plagiarism ? '是' : '否' }}
                        </span>
                      </td>
                      <td>{{ grade.submitTime }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="action-btn edit-btn" @click="openEditModal(grade)">
                            编辑
                          </button>
                          <button class="action-btn view-btn" @click="openViewModal(grade)">
                            查看评语
                          </button>
                          <button class="action-btn regrade-btn" @click="regrade(grade)">
                            重新评分
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 编辑成绩弹窗 -->
          <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>编辑成绩</h3>
                <button class="close-btn" @click="closeEditModal">×</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>学生姓名</label>
                  <input type="text" v-model="editGrade.studentName" class="form-input" readonly />
                </div>
                <div class="form-group">
                  <label>作业名称</label>
                  <input type="text" v-model="editGrade.homeworkName" class="form-input" readonly />
                </div>
                <div class="form-group">
                  <label>得分</label>
                  <input 
                    type="number" 
                    v-model.number="editGrade.score" 
                    class="form-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label>是否抄袭</label>
                  <div class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="plagiarism-toggle" 
                      v-model="editGrade.plagiarism"
                    />
                    <label for="plagiarism-toggle"></label>
                  </div>
                </div>
                <div class="form-group">
                  <label>评语</label>
                  <textarea 
                    v-model="editGrade.feedback" 
                    class="form-textarea"
                    rows="4"
                    placeholder="请输入评语..."
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" @click="closeEditModal">取消</button>
                <button class="btn-primary" @click="saveGrade">保存</button>
              </div>
            </div>
          </div>

          <!-- 查看评语弹窗 -->
          <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>查看评语</h3>
                <button class="close-btn" @click="closeViewModal">×</button>
              </div>
              <div class="modal-body">
                <div class="info-item">
                  <span class="label">学生姓名：</span>
                  <span class="value">{{ viewGrade.studentName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">作业名称：</span>
                  <span class="value">{{ viewGrade.homeworkName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">得分：</span>
                  <span class="value score" :class="getScoreClass(viewGrade.score)">{{ viewGrade.score }}</span>
                </div>
                <div class="info-item">
                  <span class="label">是否抄袭：</span>
                  <span class="value plagiarism" :class="viewGrade.plagiarism ? 'yes' : 'no'">
                    {{ viewGrade.plagiarism ? '是' : '否' }}
                  </span>
                </div>
                <div class="feedback-section">
                  <h4>评语</h4>
                  <p>{{ viewGrade.feedback || '暂无评语' }}</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-primary" @click="closeViewModal">关闭</button>
              </div>
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

const router = useRouter()

const filters = ref({
  homeworkId: '',
  classId: '',
  plagiarism: ''
})

const showEditModal = ref(false)
const showViewModal = ref(false)

const editGrade = ref({})
const viewGrade = ref({})

const homeworkList = ref([])

const classList = ref([])

const gradeList = ref([])

const filteredGrades = computed(() => {
  return gradeList.value.filter(grade => {
    if (filters.value.homeworkId && grade.homeworkId != filters.value.homeworkId) {
      return false
    }
    if (filters.value.plagiarism !== '' && grade.plagiarism != filters.value.plagiarism) {
      return false
    }
    return true
  })
})

const searchGrades = () => {
  console.log('搜索成绩:', filters.value)
}

const resetFilters = () => {
  filters.value = {
    homeworkId: '',
    classId: '',
    plagiarism: ''
  }
}

const exportExcel = () => {
  alert('正在导出Excel...')
}

const openEditModal = (grade) => {
  editGrade.value = { ...grade }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveGrade = () => {
  const index = gradeList.value.findIndex(g => g.id === editGrade.value.id)
  if (index !== -1) {
    gradeList.value[index] = { ...editGrade.value }
  }
  showEditModal.value = true
  alert('成绩保存成功')
  showEditModal.value = false
}

const openViewModal = (grade) => {
  viewGrade.value = { ...grade }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

const regrade = (grade) => {
  alert('正在重新评分...')
}

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
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

.grade-manage-container {
  max-width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 24px;
}

.filter-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.select-input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  min-width: 150px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-responsive {
  padding: 20px;
}

.grade-table {
  width: 100%;
  border-collapse: collapse;
}

.grade-table th,
.grade-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.grade-table th {
  background: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.grade-table tr:hover {
  background: #f5f9ff;
}

.score-value {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.score-value.excellent {
  color: #2e7d32;
  background: #e8f5e9;
}

.score-value.good {
  color: #1976d2;
  background: #e3f2fd;
}

.score-value.medium {
  color: #f57c00;
  background: #fff3e0;
}

.score-value.pass {
  color: #7b1fa2;
  background: #f3e5f5;
}

.score-value.fail {
  color: #d32f2f;
  background: #ffebee;
}

.plagiarism-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.plagiarism-tag.yes {
  color: #d32f2f;
  background: #ffebee;
}

.plagiarism-tag.no {
  color: #2e7d32;
  background: #e8f5e9;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #4a90e2;
  color: white;
}

.edit-btn:hover {
  background: #357abd;
}

.view-btn {
  background: #e9ecef;
  color: #333;
}

.view-btn:hover {
  background: #dee2e6;
}

.regrade-btn {
  background: #f57c00;
  color: white;
}

.regrade-btn:hover {
  background: #ef6c00;
}

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
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:readonly {
  background: #f9f9f9;
  color: #666;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  margin: 0;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: #4a90e2;
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item .label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.info-item .value {
  color: #555;
}

.info-item .value.score {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.info-item .value.plagiarism {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.feedback-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.feedback-section h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.feedback-section p {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
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
}

.btn-secondary {
  background: #e9ecef;
  color: #333;
}

.btn-secondary:hover {
  background: #dee2e6;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
    justify-content: center;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .grade-table {
    min-width: 800px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>