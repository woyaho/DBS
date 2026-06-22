<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <AdminHeader />

    <div class="content-container">
      <!-- 侧边栏 -->
      <AdminSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
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
          <div class="filter-row">
            <div class="filter-items">
              <input
                type="text"
                v-model="searchKeyword"
                placeholder="搜索日志内容"
                class="form-input"
              />
              <input
                type="text"
                v-model="operatorUsername"
                placeholder="操作人用户名"
                class="form-input"
              />
              <select v-model="logTypeFilter" class="form-select">
                <option value="">所有类型</option>
                <option value="LOGIN">登录</option>
                <option value="OPERATION">操作</option>
                <option value="ERROR">错误</option>
                <option value="SYSTEM">系统</option>
              </select>
              <select v-model="successFilter" class="form-select">
                <option value="">全部状态</option>
                <option value="true">成功</option>
                <option value="false">失败</option>
              </select>
              <button class="date-filter-btn" @click="showDateModal = true">
                <span class="date-icon">📅</span>
                <span class="date-label">{{ dateLabel }}</span>
              </button>
            </div>
            <div class="filter-actions">
              <button class="btn btn-outline" @click="resetFilters">
                重置
              </button>
              <button class="btn btn-primary" @click="loadLogs">
                查询
              </button>
            </div>
          </div>
        </div>

        <div class="log-table">
          <table class="table">
            <thead>
              <tr>
                <th>类型</th>
                <th>级别</th>
                <th>用户</th>
                <th>内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredLogs" :key="log.id">
                <td>
                  <span class="type-badge" :class="log.logType?.toLowerCase()">
                    {{ typeMap[log.logType] || '未知' }}
                  </span>
                </td>
                <td>
                  <span class="success-badge" :class="log.success ? 'success' : 'failed'">
                    {{ successMap[String(log.success)] || '未知' }}
                  </span>
                </td>
                <td>{{ log.operatorUsername || '-' }}</td>
                <td class="log-content">
                    <div class="content-main">{{ log.action || log.message || '-' }}</div>
                    <div v-if="log.requestPath" class="content-sub">{{ log.requestPath }}</div>
                  </td>
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
                <label>类型：</label>
                <span class="type-badge" :class="selectedLog.logType?.toLowerCase()">{{ typeMap[selectedLog.logType] || '未知' }}</span>
              </div>
              <div class="detail-item">
                <label>状态：</label>
                <span class="success-badge" :class="selectedLog.success ? 'success' : 'failed'">{{ successMap[String(selectedLog.success)] || '未知' }}</span>
              </div>
              <div class="detail-item">
                <label>操作人：</label>
                <span>{{ selectedLog.operatorUsername || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>时间：</label>
                <span>{{ formatDateTime(selectedLog.createdAt) || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>IP地址：</label>
                <span>{{ selectedLog.ip || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>请求路径：</label>
                <span>{{ selectedLog.requestPath || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>操作：</label>
                <div class="log-content-full">{{ selectedLog.action || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>消息：</label>
                <div class="log-content-full">{{ selectedLog.message || '-' }}</div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-primary" @click="showDetailModal = false">关闭</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 日期选择模态框 -->
        <div class="modal" v-if="showDateModal">
          <div class="modal-content calendar-modal">
            <div class="calendar-header">
              <button class="calendar-nav-btn" @click="prevMonth">‹</button>
              <div class="calendar-title">{{ calendarTitle }}</div>
              <button class="calendar-nav-btn" @click="nextMonth">›</button>
            </div>
            <div class="calendar-body">
              <div class="calendar-grid">
                <div class="calendar-month">
                  <div class="month-header">
                    <span class="month-name">{{ firstMonthName }}</span>
                  </div>
                  <div class="weekday-row">
                    <span v-for="day in weekdays" :key="day">{{ day }}</span>
                  </div>
                  <div class="days-grid">
                    <span
                      v-for="(day, index) in firstMonthDays"
                      :key="'first-' + index"
                      :class="getDayClass(day)"
                      @click="selectDate(day)"
                    >
                      {{ day.date }}
                    </span>
                  </div>
                </div>
                <div class="calendar-month">
                  <div class="month-header">
                    <span class="month-name">{{ secondMonthName }}</span>
                  </div>
                  <div class="weekday-row">
                    <span v-for="day in weekdays" :key="day">{{ day }}</span>
                  </div>
                  <div class="days-grid">
                    <span
                      v-for="(day, index) in secondMonthDays"
                      :key="'second-' + index"
                      :class="getDayClass(day)"
                      @click="selectDate(day)"
                    >
                      {{ day.date }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="calendar-footer">
              <button class="btn btn-outline calendar-btn" @click="resetDateSelection">取消</button>
              <button class="btn btn-outline calendar-btn" @click="clearSelection">清除选择</button>
              <button class="btn btn-primary calendar-btn" @click="applyDateFilter">确定</button>
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
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import { adminAPI } from '../../services/api.js'

// 日志数据
const logs = ref([])

// 筛选和分页
const searchKeyword = ref('')
const operatorUsername = ref('')
const logTypeFilter = ref('')
const successFilter = ref('')
const startDateTime = ref('')
const endDateTime = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showDetailModal = ref(false)
const showDateModal = ref(false)
const selectedLog = ref({})

// 日期标签
const dateLabel = computed(() => {
  if (startDateTime.value && endDateTime.value) {
    return `${startDateTime.value.split('T')[0]} - ${endDateTime.value.split('T')[0]}`
  } else if (startDateTime.value) {
    return `从 ${startDateTime.value.split('T')[0]}`
  } else if (endDateTime.value) {
    return `到 ${endDateTime.value.split('T')[0]}`
  }
  return '选择时间'
})

// 日历相关
const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const calendarTitle = computed(() => {
  const firstMonthName = monthNames[currentMonth.value]
  const secondMonthName = monthNames[(currentMonth.value + 1) % 12]
  const year1 = currentYear.value
  const year2 = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
  return `${year1}年${firstMonthName} - ${year2}年${secondMonthName}`
})

const firstMonthName = computed(() => {
  return monthNames[currentMonth.value]
})

const secondMonthName = computed(() => {
  return monthNames[(currentMonth.value + 1) % 12]
})

const isDateInFuture = (year, month, date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(year, month, date)
  return targetDate > today
}

const firstMonthDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startPadding = firstDay.getDay()

  for (let i = 0; i < startPadding; i++) {
    days.push({ date: 0, enabled: false })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const enabled = !isDateInFuture(currentYear.value, currentMonth.value, i)
    days.push({ date: i, enabled, year: currentYear.value, month: currentMonth.value })
  }

  return days
})

const secondMonthDays = computed(() => {
  const days = []
  const lastDay = new Date(currentYear.value, currentMonth.value + 2, 0)

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const enabled = !isDateInFuture(currentYear.value, currentMonth.value + 1, i)
    days.push({ date: i, enabled, year: currentYear.value, month: currentMonth.value + 1 })
  }

  const remaining = 42 - days.length
  for (let i = 0; i < remaining; i++) {
    days.push({ date: 0, enabled: false })
  }

  return days
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day) => {
  if (!day.enabled) return
  
  const year = day.year
  const month = day.month
  const date = day.date
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
  
  if (!startDateTime.value) {
    startDateTime.value = dateStr + 'T00:00'
  } else if (!endDateTime.value) {
    endDateTime.value = dateStr + 'T23:59'
    if (new Date(startDateTime.value) > new Date(endDateTime.value)) {
      const temp = startDateTime.value
      startDateTime.value = endDateTime.value
      endDateTime.value = temp
    }
  } else {
    startDateTime.value = dateStr + 'T00:00'
    endDateTime.value = ''
  }
}

const resetDateSelection = () => {
  startDateTime.value = ''
  endDateTime.value = ''
  showDateModal.value = false
}

const clearSelection = () => {
  startDateTime.value = ''
  endDateTime.value = ''
}

const getDayClass = (day) => {
  if (!day.enabled) {
    if (day.date === 0) return 'disabled'
    return 'future'
  }
  
  const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`
  const isStart = startDateTime.value && startDateTime.value.startsWith(dateStr)
  const isEnd = endDateTime.value && endDateTime.value.startsWith(dateStr)
  
  if (isStart && isEnd) return 'start end single'
  if (isStart) return 'start'
  if (isEnd) return 'end'
  
  if (startDateTime.value && endDateTime.value) {
    const start = new Date(startDateTime.value)
    const end = new Date(endDateTime.value)
    const current = new Date(day.year, day.month, day.date)
    if (current >= start && current <= end) {
      return 'between'
    }
  }
  
  return 'enabled'
}

// 映射（后端使用大写）
const typeMap = {
  LOGIN: '登录',
  OPERATION: '操作',
  ERROR: '错误',
  SYSTEM: '系统'
}

const successMap = {
  true: '成功',
  false: '失败'
}

// 计算属性
const filteredLogs = computed(() => {
  let result = logs.value.filter(log => {
    const matchesSearch = !searchKeyword.value ||
      (log.action && log.action.includes(searchKeyword.value)) ||
      (log.message && log.message.includes(searchKeyword.value)) ||
      (log.requestPath && log.requestPath.includes(searchKeyword.value))
    const matchesType = !logTypeFilter.value || log.logType === logTypeFilter.value
    const matchesSuccess = !successFilter.value || String(log.success) === successFilter.value
    const matchesOperator = !operatorUsername.value ||
      log.operatorUsername === operatorUsername.value
    const matchesDate = (!startDateTime.value || log.createdAt >= formatToISO(startDateTime.value)) &&
                       (!endDateTime.value || log.createdAt <= formatToISO(endDateTime.value))
    return matchesSearch && matchesType && matchesSuccess && matchesOperator && matchesDate
  })

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const filteredCount = logs.value.filter(log => {
    const matchesSearch = !searchKeyword.value ||
      (log.action && log.action.includes(searchKeyword.value)) ||
      (log.message && log.message.includes(searchKeyword.value)) ||
      (log.requestPath && log.requestPath.includes(searchKeyword.value))
    const matchesType = !logTypeFilter.value || log.logType === logTypeFilter.value
    const matchesSuccess = !successFilter.value || String(log.success) === successFilter.value
    const matchesOperator = !operatorUsername.value ||
      log.operatorUsername === operatorUsername.value
    const matchesDate = (!startDateTime.value || log.createdAt >= formatToISO(startDateTime.value)) &&
                       (!endDateTime.value || log.createdAt <= formatToISO(endDateTime.value))
    return matchesSearch && matchesType && matchesSuccess && matchesOperator && matchesDate
  }).length
  return Math.ceil(filteredCount / pageSize.value)
})

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  if (isNaN(date.getTime())) return datetime
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatToISO = (datetime) => {
  if (!datetime) return ''
  return datetime + ':00'
}

const resetFilters = () => {
  searchKeyword.value = ''
  operatorUsername.value = ''
  logTypeFilter.value = ''
  successFilter.value = ''
  startDateTime.value = ''
  endDateTime.value = ''
  currentPage.value = 1
  loadLogs()
}

const loadLogs = async () => {
  try {
    const params = {}
    if (logTypeFilter.value) params.logType = logTypeFilter.value
    if (operatorUsername.value) params.operatorUsername = operatorUsername.value
    if (successFilter.value) params.success = successFilter.value === 'true'
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (startDateTime.value) params.startTime = formatToISO(startDateTime.value)
    if (endDateTime.value) params.endTime = formatToISO(endDateTime.value)

    console.log('[DEBUG] 日志查询参数:', params)
    
    const response = await adminAPI.getSystemLogs(params)
    console.log('[DEBUG] 日志查询响应:', response)
    
    if (response.code === 200 && response.data) {
      logs.value = response.data
      console.log('[DEBUG] 日志数据:', logs.value)
      console.log('[DEBUG] 日志数量:', logs.value.length)
    } else {
      console.log('[DEBUG] 无数据返回或响应错误')
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    alert('加载日志失败，请刷新页面重试')
  }
}

const applyDateFilter = () => {
  showDateModal.value = false
  currentPage.value = 1
  loadLogs()
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
  loadLogs()
})
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  min-height: 100vh;
  background: var(--bg-page);
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
  margin-left: 200px;
  display: flex;
  flex-direction: column;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 24px;
  padding-top: 80px;
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

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-items {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 20px;
  border-left: 1px solid #eee;
  flex-shrink: 0;
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
  gap: 12px;
}

.date-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-filter-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.date-filter-btn:active {
  transform: scale(0.98);
}

.date-icon {
  font-size: 18px;
}

.date-label {
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-modal {
  max-width: 450px;
}

.date-picker-container {
  display: flex;
  gap: 24px;
}

.date-input-group {
  flex: 1;
}

.date-input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.calendar-modal {
  max-width: 680px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 20px;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.calendar-nav-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.calendar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.calendar-body {
  padding: 20px;
  background: #ffffff;
}

.calendar-grid {
  display: flex;
  gap: 24px;
}

.calendar-month {
  flex: 1;
}

.month-header {
  text-align: center;
  margin-bottom: 16px;
}

.month-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-row span {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  padding: 6px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.days-grid span {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.days-grid span.disabled {
  opacity: 0;
  cursor: default;
}

.days-grid span.future {
  opacity: 0.4;
  cursor: not-allowed;
  color: #9ca3af;
}

.days-grid span.enabled:hover {
  background: #e5e7eb;
}

.days-grid span.start,
.days-grid span.end {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.days-grid span.start {
  border-radius: 50% 0 0 50%;
}

.days-grid span.end {
  border-radius: 0 50% 50% 0;
}

.days-grid span.single {
  border-radius: 50%;
}

.days-grid span.between {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 0;
}

.calendar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.calendar-btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
}

.calendar-btn.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.calendar-btn.btn-outline:hover {
  background: #f3f4f6;
}

.calendar-btn.btn-primary {
  background: #3b82f6;
  border: none;
  color: white;
}

.calendar-btn.btn-primary:hover {
  background: #2563eb;
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

.success-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.success-badge.success {
  background: #e8f5e8;
  color: #4caf50;
}

.success-badge.failed {
  background: #ffebee;
  color: #f44336;
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
  white-space: normal;
}

.content-main {
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.content-sub {
  font-size: 12px;
  color: #9ca3af;
  font-family: monospace;
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

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-items {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    padding-left: 0;
    border-left: none;
    justify-content: flex-end;
  }

  .calendar-grid {
    flex-direction: column;
    gap: 16px;
  }

  .calendar-modal {
    width: 95%;
    max-width: 95%;
  }

  .calendar-header {
    padding: 16px;
  }

  .calendar-body {
    padding: 16px;
  }

  .calendar-footer {
    padding: 16px;
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
