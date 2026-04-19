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
          <h2>系统日志</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportLogs">
              <span class="btn-icon">📤</span>
              <span>导出</span>
            </button>
            <button class="btn btn-danger" @click="clearLogs">
              <span class="btn-icon">🗑️</span>
              <span>清理</span>
            </button>
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索日志内容" 
              class="form-input"
            />
            <select v-model="logTypeFilter" class="form-select">
              <option value="">所有类型</option>
              <option value="login">登录</option>
              <option value="operation">操作</option>
              <option value="error">错误</option>
              <option value="system">系统</option>
            </select>
            <select v-model="logLevelFilter" class="form-select">
              <option value="">所有级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
            </select>
            <div class="date-range">
              <input 
                type="date" 
                v-model="startDate" 
                class="form-input"
                placeholder="开始日期"
              />
              <span class="date-separator">至</span>
              <input 
                type="date" 
                v-model="endDate" 
                class="form-input"
                placeholder="结束日期"
              />
            </div>
            <button class="btn btn-outline" @click="resetFilters">
              重置
            </button>
          </div>
        </div>

        <div class="log-table">
          <table class="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>级别</th>
                <th>用户</th>
                <th>IP地址</th>
                <th>内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredLogs" :key="log.id">
                <td>{{ log.timestamp }}</td>
                <td>
                  <span class="type-badge" :class="log.type">
                    {{ typeMap[log.type] }}
                  </span>
                </td>
                <td>
                  <span class="level-badge" :class="log.level">
                    {{ levelMap[log.level] }}
                  </span>
                </td>
                <td>{{ log.user }}</td>
                <td>{{ log.ip }}</td>
                <td class="log-content">{{ log.content }}</td>
                <td class="actions">
                  <button class="action-btn detail" @click="viewLogDetail(log)">
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button 
            class="btn btn-outline" 
            @click="currentPage--" 
            :disabled="currentPage === 1"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          <button 
            class="btn btn-outline" 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
        </div>

        <!-- 日志详情模态框 -->
        <div class="modal" v-if="showDetailModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>日志详情</h3>
              <button class="close-btn" @click="showDetailModal = false">×</button>
            </div>
            <div class="modal-body">
              <div class="detail-item">
                <label>时间：</label>
                <span>{{ selectedLog.timestamp }}</span>
              </div>
              <div class="detail-item">
                <label>类型：</label>
                <span class="type-badge" :class="selectedLog.type">{{ typeMap[selectedLog.type] }}</span>
              </div>
              <div class="detail-item">
                <label>级别：</label>
                <span class="level-badge" :class="selectedLog.level">{{ levelMap[selectedLog.level] }}</span>
              </div>
              <div class="detail-item">
                <label>用户：</label>
                <span>{{ selectedLog.user }}</span>
              </div>
              <div class="detail-item">
                <label>IP地址：</label>
                <span>{{ selectedLog.ip }}</span>
              </div>
              <div class="detail-item">
                <label>内容：</label>
                <div class="log-content-full">{{ selectedLog.content }}</div>
              </div>
              <div class="detail-item" v-if="selectedLog.details">
                <label>详细信息：</label>
                <pre class="log-details">{{ selectedLog.details }}</pre>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-primary" @click="showDetailModal = false">关闭</button>
              </div>
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

// 日志数据
const logs = ref([])

// 筛选和分页
const searchKeyword = ref('')
const logTypeFilter = ref('')
const logLevelFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showDetailModal = ref(false)
const selectedLog = ref({})

// 映射
const typeMap = {
  login: '登录',
  operation: '操作',
  error: '错误',
  system: '系统'
}

const levelMap = {
  info: '信息',
  warning: '警告',
  error: '错误'
}

// 计算属性
const filteredLogs = computed(() => {
  let result = logs.value.filter(log => {
    const matchesSearch = !searchKeyword.value || log.content.includes(searchKeyword.value)
    const matchesType = !logTypeFilter.value || log.type === logTypeFilter.value
    const matchesLevel = !logLevelFilter.value || log.level === logLevelFilter.value
    const matchesDate = (!startDate.value || log.timestamp >= startDate.value) && 
                       (!endDate.value || log.timestamp <= endDate.value)
    return matchesSearch && matchesType && matchesLevel && matchesDate
  })
  
  // 按时间倒序排序
  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const filteredCount = logs.value.filter(log => {
    const matchesSearch = !searchKeyword.value || log.content.includes(searchKeyword.value)
    const matchesType = !logTypeFilter.value || log.type === logTypeFilter.value
    const matchesLevel = !logLevelFilter.value || log.level === logLevelFilter.value
    const matchesDate = (!startDate.value || log.timestamp >= startDate.value) && 
                       (!endDate.value || log.timestamp <= endDate.value)
    return matchesSearch && matchesType && matchesLevel && matchesDate
  }).length
  return Math.ceil(filteredCount / pageSize.value)
})

// 方法
const resetFilters = () => {
  searchKeyword.value = ''
  logTypeFilter.value = ''
  logLevelFilter.value = ''
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

const viewLogDetail = (log) => {
  selectedLog.value = { ...log }
  showDetailModal.value = true
}

const exportLogs = () => {
  // 实际项目中这里会生成CSV或Excel文件
  alert('日志导出成功')
}

const clearLogs = () => {
  if (confirm('确定要清理所有日志吗？此操作不可恢复。')) {
    // 实际项目中这里会调用后端API清理日志
    logs.value = []
    alert('日志清理成功')
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

.btn-secondary {
  background: #f5f9ff;
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.btn-secondary:hover {
  background: #e3f2fd;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ffebee;
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-danger:hover {
  background: #ffcdd2;
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
  flex-wrap: wrap;
}

.form-input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  min-width: 150px;
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
  min-width: 120px;
}

.form-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: #666;
  font-size: 14px;
}

.log-table {
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
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #1a2a3a;
  font-size: 14px;
  white-space: nowrap;
}

.table tr:hover {
  background: #f5f9ff;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.login {
  background: #e3f2fd;
  color: #4a90e2;
}

.type-badge.operation {
  background: #e8f5e8;
  color: #4caf50;
}

.type-badge.error {
  background: #ffebee;
  color: #f44336;
}

.type-badge.system {
  background: #fff3e0;
  color: #ff9800;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.level-badge.info {
  background: #e3f2fd;
  color: #4a90e2;
}

.level-badge.warning {
  background: #fff3e0;
  color: #ff9800;
}

.level-badge.error {
  background: #ffebee;
  color: #f44336;
}

.log-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
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

.action-btn.detail {
  background: #f5f9ff;
  color: #4a90e2;
}

.action-btn.detail:hover {
  background: #e3f2fd;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-info {
  font-size: 14px;
  color: #666;
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
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow-y: auto;
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
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-item label {
  font-weight: 600;
  color: #1a2a3a;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item span {
  color: #666;
  flex: 1;
}

.log-content-full {
  flex: 1;
  color: #666;
  white-space: pre-wrap;
  line-height: 1.5;
}

.log-details {
  flex: 1;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  color: #333;
  max-height: 200px;
  overflow-y: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  background: #4a90e2;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #357abd;
  transform: translateY(-1px);
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

  .date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .date-separator {
    display: none;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 12px;
  }

  .log-content {
    max-width: 150px;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }

  .detail-item {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .detail-item label {
    min-width: auto;
  }
}
</style>