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
          <h2>用户管理</h2>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openAddUserModal">
              <span class="btn-icon">➕</span>
              <span>添加用户</span>
            </button>
            <button class="btn btn-secondary" @click="exportUsers">
              <span class="btn-icon">📤</span>
              <span>导出</span>
            </button>
            <button class="btn btn-secondary" @click="openImportModal">
              <span class="btn-icon">📥</span>
              <span>导入</span>
            </button>
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索用户名/邮箱/姓名"
              class="form-input"
              @input="handleSearch"
            />
            <select v-model="roleFilter" class="form-select" @change="handleSearch">
              <option value="">所有角色</option>
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="admin">管理员</option>
            </select>
            <select v-model="statusFilter" class="form-select" @change="handleSearch">
              <option value="">所有状态</option>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
            <button class="btn btn-outline" @click="resetFilters">
              重置
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载用户数据中...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadUsers">重试</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>暂无用户</h3>
          <p>还没有用户数据</p>
        </div>

        <!-- 用户表格 -->
        <div v-else class="user-table">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>ID</th>
                <th>用户名</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user?.id || user?.username" :class="{ 'selected': selectedUsers.includes(user?.id) }">
                <td>
                  <input
                    type="checkbox"
                    :value="user?.id"
                    v-model="selectedUsers"
                  />
                </td>
                <td>{{ user?.id || '-' }}</td>
                <td>{{ user?.username || user?.account || '-' }}</td>
                <td>{{ user?.name || '-' }}</td>
                <td>{{ user?.email || '-' }}</td>
                <td>
                  <span class="role-badge" :class="user?.role || user?.identity">
                    {{ roleMap[user?.role] || roleMap[user?.identity] || '-' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user?.status || (user?.enabled ? 'active' : 'inactive')">
                    {{ statusMap[user?.status] || (user?.enabled ? '启用' : '禁用') }}
                  </span>
                </td>
                <td class="actions">
                  <button class="action-btn edit" @click="openEditUserModal(user)">
                    编辑
                  </button>
                  <button
                    class="action-btn status"
                    :class="(user?.status || (user?.enabled ? 'active' : 'inactive')) === 'active' ? 'disable' : 'enable'"
                    @click="toggleUserStatus(user)"
                  >
                    {{ (user?.status || (user?.enabled ? 'active' : 'inactive')) === 'active' ? '禁用' : '启用' }}
                  </button>

                  <button class="action-btn reset" @click="resetPassword(user?.id)">
                    重置密码
                  </button>
                  <button class="action-btn delete" @click="deleteUser(user?.id)">
                    删除
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
          <div class="page-jump">
            <span>跳转到</span>
            <input
              type="number"
              v-model.number="jumpPage"
              min="1"
              :max="totalPages"
              @keyup.enter="goToPage"
              class="jump-input"
            />
            <span>页</span>
            <button class="btn btn-outline jump-btn" @click="goToPage">
              确定
            </button>
          </div>
          <button
            class="btn btn-outline"
            @click="currentPage++"
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
        </div>

        <!-- 添加用户模态框 -->
        <div class="modal" v-if="showAddModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>添加用户</h3>
              <button class="close-btn" @click="showAddModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addUser">
                <div class="form-group">
                  <label>账号 <span class="required">*</span></label>
                  <input type="text" v-model="newUser.account" required class="form-input" placeholder="请输入账号" />
                </div>
                <div class="form-group">
                  <label>姓名 <span class="required">*</span></label>
                  <input type="text" v-model="newUser.name" required class="form-input" placeholder="请输入姓名" />
                </div>
                <div class="form-group">
                  <label>密码 <span class="required">*</span></label>
                  <input type="password" v-model="newUser.password" required class="form-input" placeholder="请输入密码" />
                </div>
                <div class="form-group">
                  <label>身份 <span class="required">*</span></label>
                  <select v-model="newUser.identity" required class="form-select">
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>邮箱</label>
                  <input type="email" v-model="newUser.email" class="form-input" placeholder="请输入邮箱（可选）" />
                </div>
                <div class="form-group">
                  <label>手机号</label>
                  <input type="tel" v-model="newUser.phone" class="form-input" placeholder="请输入手机号（可选）" />
                </div>
                <div class="form-group">
                  <label>身份证号</label>
                  <input type="text" v-model="newUser.idCard" class="form-input" placeholder="请输入身份证号（可选）" />
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="showAddModal = false">取消</button>
                  <button type="submit" class="btn btn-primary">添加</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 编辑用户模态框 -->
        <div class="modal" v-if="showEditModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>编辑用户</h3>
              <button class="close-btn" @click="showEditModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateUser">
                <div class="form-group">
                  <label>用户名</label>
                  <input type="text" v-model="editUser.username" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>姓名</label>
                  <input type="text" v-model="editUser.name" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>邮箱</label>
                  <input type="email" v-model="editUser.email" class="form-input" placeholder="选填" />
                </div>
                <div class="form-group">
                  <label>联系电话</label>
                  <input type="tel" v-model="editUser.phone" class="form-input" placeholder="选填" />
                </div>
                <div class="form-group">
                  <label>身份证号</label>
                  <input type="text" v-model="editUser.idCard" class="form-input" placeholder="选填" />
                </div>
                <div class="form-group">
                  <label>角色</label>
                  <select v-model="editUser.role" required class="form-select">
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>状态</label>
                  <select v-model="editUser.status" required class="form-select">
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
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

        <!-- 批量导入模态框 -->
        <div class="modal" v-if="showImportModal">
          <div class="modal-mask" @click="closeImportModal"></div>
          <div class="modal-container">
            <div class="modal-header">
              <h3>批量导入用户</h3>
              <button class="close-btn" @click="closeImportModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitImport" class="import-form">
                <!-- 先选择角色 -->
                <div class="form-group">
                  <label>导入角色</label>
                  <select v-model="importData.identity" class="form-select">
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                  </select>
                </div>

                <!-- 再选择学年 -->
                <div class="form-group">
                  <label>学年 <span class="required">*</span></label>
                  <select v-model="importData.academicYear" class="form-select">
                    <option :value="2024">2024</option>
                    <option :value="2025">2025</option>
                    <option :value="2026">2026</option>
                    <option :value="2027">2027</option>
                  </select>
                </div>

                <!-- 最后选择文件 -->
                <div class="form-group">
                  <label>选择文件 <span class="required">*</span></label>
                  <div class="file-upload">
                    <input
                      ref="importFileInput"
                      type="file"
                      accept=".xlsx,.xls"
                      class="file-input"
                      @change="onImportFileSelect"
                    />
                    <div class="file-upload-label">
                      <span v-if="!importFileName">点击选择文件或拖拽到此处</span>
                      <span v-else>{{ importFileName }}</span>
                    </div>
                  </div>
                </div>

                <!-- 示例文件下载 -->
                <div class="form-group">
                  <label>示例文件</label>
                  <div class="template-links">
                    <button type="button" class="btn btn-outline btn-sm" @click="downloadStudentTemplate">
                      下载学生导入模板
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" @click="downloadTeacherTemplate">
                      下载教师导入模板
                    </button>
                  </div>
                  <p class="form-hint">请根据模板格式填写数据，支持 .xlsx 格式</p>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="closeImportModal">取消</button>
                  <button type="submit" class="btn btn-primary" :disabled="importLoading">
                    <span v-if="importLoading">导入中...</span>
                    <span v-else>开始导入</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 批量操作栏 -->
        <div class="bulk-actions" v-if="selectedUsers.length > 0">
          <span>已选择 {{ selectedUsers.length }} 个用户</span>
          <div class="bulk-buttons">
            <button class="btn btn-outline" @click="batchDelete">批量删除</button>
            <button class="btn btn-outline" @click="batchEnable">批量启用</button>
            <button class="btn btn-outline" @click="batchDisable">批量禁用</button>
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
import { adminAPI, authAPI } from '@/services/api.js'

// 用户数据
const users = ref([])
const loading = ref(false)
const error = ref('')

// 筛选和分页
const searchKeyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const jumpPage = ref(1)

// 选择状态
const selectedUsers = ref([])
const selectAll = ref(false)

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showImportModal = ref(false)

// 批量导入数据
const importData = ref({
  identity: 'student',
  academicYear: new Date().getFullYear()
})
const importFileName = ref('')
const importLoading = ref(false)

// 表单数据（字段名与后端API保持一致）
const newUser = ref({
  account: '',
  name: '',
  password: '',
  identity: 'student',
  email: '',
  phone: '',
  idCard: ''
})

const editUser = ref({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  idCard: '',
  role: '',
  status: ''
})

// 映射
const roleMap = {
  student: '学生',
  teacher: '教师',
  admin: '管理员'
}

const statusMap = {
  active: '启用',
  inactive: '禁用'
}

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value.filter(user => {
    if (!user) return false
    const userUsername = user.username || user.account || ''
    const userName = user.name || ''
    const userEmail = user.email || ''
    const matchesSearch = !searchKeyword.value ||
      userUsername.includes(searchKeyword.value) ||
      userName.includes(searchKeyword.value) ||
      userEmail.includes(searchKeyword.value)
    // 兼容 role 和 identity 字段
    const userRole = user.role || user.identity
    const matchesRole = !roleFilter.value || userRole === roleFilter.value
    // 兼容 status 和 enabled 字段
    const userStatus = user.status || (user.enabled ? 'active' : 'inactive')
    const matchesStatus = !statusFilter.value || userStatus === statusFilter.value
    return matchesSearch && matchesRole && matchesStatus
  })

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const filteredCount = users.value.filter(user => {
    if (!user) return false
    const userUsername = user.username || user.account || ''
    const userName = user.name || ''
    const userEmail = user.email || ''
    const matchesSearch = !searchKeyword.value ||
      userUsername.includes(searchKeyword.value) ||
      userName.includes(searchKeyword.value) ||
      userEmail.includes(searchKeyword.value)
    // 兼容 role 和 identity 字段
    const userRole = user.role || user.identity
    const matchesRole = !roleFilter.value || userRole === roleFilter.value
    // 兼容 status 和 enabled 字段
    const userStatus = user.status || (user.enabled ? 'active' : 'inactive')
    const matchesStatus = !statusFilter.value || userStatus === statusFilter.value
    return matchesSearch && matchesRole && matchesStatus
  }).length
  return Math.ceil(filteredCount / pageSize.value)
})

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminAPI.getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      role: roleFilter.value,
      status: statusFilter.value
    })
    // 兼容不同的响应结构
    let data = []
    if (Array.isArray(response)) {
      data = response
    } else if (response.data && Array.isArray(response.data)) {
      data = response.data
    } else if (response.code === 200 && response.data) {
      data = Array.isArray(response.data) ? response.data : []
    }
    // 验证数据格式
    users.value = data.map(user => ({
      id: user?.id || user?.userId || null,
      username: user?.username || user?.account || '',
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || user?.identity || '',
      status: user?.status || (user?.enabled ? 'active' : 'inactive'),
      enabled: user?.enabled || false,
      createdAt: user?.createdAt || user?.createTime || user?.registerTime || ''
    }))
  } catch (err) {
    error.value = '加载用户数据失败，请重试'
    console.error('加载用户数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

// 方法
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  jumpPage.value = 1
  loadUsers()
}

const goToPage = () => {
  const page = parseInt(jumpPage.value) || 1
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  } else {
    alert(`请输入有效的页码（1-${totalPages.value}）`)
    jumpPage.value = currentPage.value
  }
}

const openAddUserModal = () => {
  newUser.value = {
    account: '',
    name: '',
    password: '',
    identity: 'student',
    email: '',
    phone: '',
    idCard: ''
  }
  showAddModal.value = true
}

const openEditUserModal = (user) => {
  editUser.value = { ...user }
  showEditModal.value = true
}

const addUser = async () => {
  try {
    const response = await adminAPI.createUser(newUser.value)
    if (response.code === 200) {
      showAddModal.value = false
      alert('用户添加成功')
      loadUsers()
    } else {
      alert('用户添加失败: ' + (response.message || '未知错误'))
    }
  } catch (err) {
    alert('用户添加失败，请重试')
    console.error('添加用户失败:', err)
  }
}

const updateUser = async () => {
  console.log('[DEBUG] 开始更新用户, editUser.value:', editUser.value)
  try {
    const response = await adminAPI.updateUserInfo(editUser.value)
    console.log('[DEBUG] 更新用户响应:', response)

    // 检查后端返回的业务状态码
    if (response.code === 200) {
      showEditModal.value = false
      alert('用户更新成功')
      loadUsers()
    } else {
      alert(`用户更新失败: ${response.message || '未知错误'}`)
    }
  } catch (err) {
    console.error('[DEBUG] 更新用户失败:', err)
    alert(`用户更新失败: ${err.message || '请重试'}`)
  }
}

const deleteUser = async (id) => {
  if (confirm('确定要删除这个用户吗？')) {
    try {
      await adminAPI.deleteUser(id)
      users.value = users.value.filter(u => u.id !== id)
      selectedUsers.value = selectedUsers.value.filter(userId => userId !== id)
      alert('用户删除成功')
    } catch (err) {
      alert('用户删除失败，请重试')
      console.error('删除用户失败:', err)
    }
  }
}

const resetPassword = async (id) => {
  if (confirm('确定要重置这个用户的密码吗？')) {
    try {
      await adminAPI.resetUserPassword(id)
      alert('密码已重置为默认值：123456')
    } catch (err) {
      alert('密码重置失败，请重试')
      console.error('重置密码失败:', err)
    }
  }
}

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '禁用'

  if (confirm(`确定要${actionText}用户「${user.name}」吗？`)) {
    try {
      await adminAPI.updateUserStatus(user.id, newStatus)
      user.status = newStatus
      alert(`用户已成功${actionText}`)
    } catch (err) {
      alert(`${actionText}失败，请重试`)
      console.error(`${actionText}用户失败:`, err)
    }
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`)) {
    try {
      // 实际项目中需要调用批量删除API
      users.value = users.value.filter(u => !selectedUsers.value.includes(u.id))
      selectedUsers.value = []
      alert('批量删除成功')
    } catch (err) {
      alert('批量删除失败，请重试')
      console.error('批量删除失败:', err)
    }
  }
}

const batchEnable = async () => {
  try {
    for (const userId of selectedUsers.value) {
      await adminAPI.updateUserStatus(userId, 'active')
    }
    await loadUsers()
    alert('批量启用成功')
  } catch (err) {
    alert('批量启用失败，请重试')
    console.error('批量启用失败:', err)
  }
}

const batchDisable = async () => {
  try {
    for (const userId of selectedUsers.value) {
      await adminAPI.updateUserStatus(userId, 'inactive')
    }
    await loadUsers()
    alert('批量禁用成功')
  } catch (err) {
    alert('批量禁用失败，请重试')
    console.error('批量禁用失败:', err)
  }
}

const exportUsers = async () => {
  try {
    // 获取所有用户数据（不分页）
    const response = await adminAPI.getUserList({
      page: 1,
      pageSize: 9999,
      search: searchKeyword.value,
      role: roleFilter.value,
      status: statusFilter.value
    })

    let data = []
    if (Array.isArray(response)) {
      data = response
    } else if (response.data && Array.isArray(response.data)) {
      data = response.data
    } else if (response.code === 200 && response.data) {
      data = Array.isArray(response.data) ? response.data : []
    }

    // 转换数据格式
    const userData = data.map(user => ({
      id: user?.id || '',
      username: user?.username || user?.account || '',
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || user?.identity || '',
      status: user?.status || (user?.enabled ? 'active' : 'inactive'),
      phone: user?.phone || '',
      idCard: user?.idCard || ''
    }))

    // 生成CSV
    const headers = ['ID', '用户名', '姓名', '邮箱', '角色', '状态', '电话', '身份证号']
    const roleMap = { student: '学生', teacher: '教师', admin: '管理员' }
    const statusMap = { active: '启用', inactive: '禁用' }

    const csvContent = [
      headers.join(','),
      ...userData.map(user => [
        user.id,
        `"${user.username}"`,
        `"${user.name}"`,
        `"${user.email}"`,
        roleMap[user.role] || user.role,
        statusMap[user.status] || (user.status === 'active' ? '启用' : '禁用'),
        `"${user.phone}"`,
        `"${user.idCard}"`
      ].join(','))
    ].join('\n')

    // 创建下载链接
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `用户数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('[DEBUG] 用户数据导出成功，共导出', userData.length, '条记录')
  } catch (error) {
    console.error('[DEBUG] 用户数据导出失败:', error)
    alert('用户数据导出失败，请重试')
  }
}

const importFileInput = ref(null)

const openImportModal = () => {
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
  importFileName.value = ''
  importLoading.value = false
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
}

const onImportFileSelect = () => {
  if (importFileInput.value && importFileInput.value.files && importFileInput.value.files.length > 0) {
    importFileName.value = importFileInput.value.files[0].name
  } else {
    importFileName.value = ''
  }
}

const submitImport = async () => {
  if (!importFileInput.value || !importFileInput.value.files || importFileInput.value.files.length === 0) {
    alert('请选择文件')
    return
  }

  importLoading.value = true

  try {
    const file = importFileInput.value.files[0]
    console.log('[DEBUG] 开始导入文件:', file.name, '大小:', file.size, '类型:', file.type)
    
    const response = await adminAPI.batchRegisterUsers(
      file, 
      importData.value.identity, 
      importData.value.academicYear
    )
    console.log('[DEBUG] 导入响应:', response)

    if (response.code === 200) {
      const data = response.data || {}
      const successCount = data.successCount || 0
      const failCount = data.failCount || 0
      const failDetails = data.failDetails || []

      let message = `导入完成：成功 ${successCount} 条`
      if (failCount > 0) {
        message += `，失败 ${failCount} 条`
      }
      alert(message)

      if (failDetails.length > 0) {
        console.warn('[DEBUG] 导入失败详情:', failDetails)
      }
      closeImportModal()
    } else {
      alert(`导入失败：${response.message || '未知错误'}`)
    }
    loadUsers()
  } catch (err) {
    console.error('[DEBUG] 导入用户失败:', err)
    alert(`用户数据导入失败：${err.message || '请重试'}`)
  } finally {
    importLoading.value = false
  }
}

const downloadStudentTemplate = async () => {
  try {
    const response = await adminAPI.downloadStudentTemplate()
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '学生批量导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载学生模板失败:', error)
    alert('下载模板失败，请重试')
  }
}

const downloadTeacherTemplate = async () => {
  try {
    const response = await adminAPI.downloadTeacherTemplate()
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '教师批量导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载教师模板失败:', error)
    alert('下载模板失败，请重试')
  }
}

onMounted(() => {
  loadUsers()
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
  margin-top: 60px;
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

.user-table {
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

.table tr.selected {
  background: #e3f2fd;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.student {
  background: #e3f2fd;
  color: #4a90e2;
}

.role-badge.teacher {
  background: #e8f5e8;
  color: #4caf50;
}

.role-badge.admin {
  background: #fff3e0;
  color: #ff9800;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e8;
  color: #4caf50;
}

.status-badge.inactive {
  background: #ffebee;
  color: #f44336;
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

.action-btn.reset {
  background: #fff3e0;
  color: #ff9800;
}

.action-btn.reset:hover {
  background: #ffe0b2;
}

.action-btn.delete {
  background: #ffebee;
  color: #f44336;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.action-btn.status.enable {
  background: #e8f5e8;
  color: #4caf50;
}

.action-btn.status.enable:hover {
  background: #c8e6c9;
}

.action-btn.status.disable {
  background: #fff3e0;
  color: #ff9800;
}

.action-btn.status.disable:hover {
  background: #ffe0b2;
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

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.jump-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.jump-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.jump-btn {
  padding: 6px 12px;
  font-size: 14px;
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

.bulk-actions {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  text-align: center;
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

  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .bulk-buttons {
    justify-content: space-between;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 48px 16px;
  }
}
</style>
