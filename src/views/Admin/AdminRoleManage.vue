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
          <h2>角色权限管理</h2>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openAddRoleModal">
              <span class="btn-icon">➕</span>
              <span>添加角色</span>
            </button>
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索角色名称" 
              class="form-input"
            />
            <button class="btn btn-outline" @click="resetFilters">
              重置
            </button>
          </div>
        </div>

        <div class="role-table">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>角色名称</th>
                <th>角色描述</th>
                <th>权限数量</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in filteredRoles" :key="role.id">
                <td>{{ role.id }}</td>
                <td>{{ role.name }}</td>
                <td>{{ role.description }}</td>
                <td>{{ role.permissions.length }}</td>
                <td>{{ role.createdAt }}</td>
                <td class="actions">
                  <button class="action-btn edit" @click="openEditRoleModal(role)">
                    编辑
                  </button>
                  <button class="action-btn permission" @click="openPermissionModal(role)">
                    权限
                  </button>
                  <button class="action-btn delete" @click="deleteRole(role.id)" :disabled="role.name === 'admin'">
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
          <button 
            class="btn btn-outline" 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
        </div>

        <!-- 添加角色模态框 -->
        <div class="modal" v-if="showAddModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>添加角色</h3>
              <button class="close-btn" @click="showAddModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addRole">
                <div class="form-group">
                  <label>角色名称</label>
                  <input type="text" v-model="newRole.name" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>角色描述</label>
                  <textarea v-model="newRole.description" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="showAddModal = false">取消</button>
                  <button type="submit" class="btn btn-primary">添加</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 编辑角色模态框 -->
        <div class="modal" v-if="showEditModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>编辑角色</h3>
              <button class="close-btn" @click="showEditModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateRole">
                <div class="form-group">
                  <label>角色名称</label>
                  <input type="text" v-model="editRole.name" required class="form-input" :disabled="editRole.name === 'admin'" />
                </div>
                <div class="form-group">
                  <label>角色描述</label>
                  <textarea v-model="editRole.description" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="showEditModal = false">取消</button>
                  <button type="submit" class="btn btn-primary">保存</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 权限分配模态框 -->
        <div class="modal" v-if="showPermissionModal">
          <div class="modal-content permission-modal">
            <div class="modal-header">
              <h3>权限分配 - {{ selectedRole.name }}</h3>
              <button class="close-btn" @click="showPermissionModal = false">×</button>
            </div>
            <div class="modal-body">
              <div class="permission-groups">
                <div v-for="group in permissionGroups" :key="group.name" class="permission-group">
                  <h4>{{ group.label }}</h4>
                  <div class="permission-items">
                    <label v-for="permission in group.permissions" :key="permission.name" class="permission-item">
                      <input 
                        type="checkbox" 
                        :value="permission.name" 
                        v-model="selectedPermissions"
                      />
                      <span class="permission-name">{{ permission.label }}</span>
                      <span class="permission-desc">{{ permission.description }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="showPermissionModal = false">取消</button>
                <button type="button" class="btn btn-primary" @click="savePermissions">保存权限</button>
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

// 角色数据
const roles = ref([])

// 权限组
const permissionGroups = ref([
  {
    name: 'user',
    label: '用户管理',
    permissions: [
      { name: 'user:manage', label: '用户管理', description: '管理系统用户' },
      { name: 'user:create', label: '创建用户', description: '创建新用户' },
      { name: 'user:edit', label: '编辑用户', description: '编辑用户信息' },
      { name: 'user:delete', label: '删除用户', description: '删除用户' }
    ]
  },
  {
    name: 'role',
    label: '角色权限',
    permissions: [
      { name: 'role:manage', label: '角色管理', description: '管理系统角色' },
      { name: 'role:create', label: '创建角色', description: '创建新角色' },
      { name: 'role:edit', label: '编辑角色', description: '编辑角色信息' },
      { name: 'role:delete', label: '删除角色', description: '删除角色' },
      { name: 'permission:assign', label: '分配权限', description: '为角色分配权限' }
    ]
  },
  {
    name: 'homework',
    label: '作业管理',
    permissions: [
      { name: 'homework:manage', label: '作业管理', description: '管理作业' },
      { name: 'homework:create', label: '创建作业', description: '创建新作业' },
      { name: 'homework:edit', label: '编辑作业', description: '编辑作业信息' },
      { name: 'homework:delete', label: '删除作业', description: '删除作业' },
      { name: 'homework:submit', label: '提交作业', description: '提交作业' },
      { name: 'homework:review', label: '评阅作业', description: '评阅学生作业' }
    ]
  },
  {
    name: 'grade',
    label: '成绩管理',
    permissions: [
      { name: 'grade:manage', label: '成绩管理', description: '管理学生成绩' },
      { name: 'grade:edit', label: '编辑成绩', description: '编辑学生成绩' },
      { name: 'grade:query', label: '查询成绩', description: '查询学生成绩' },
      { name: 'grade:statistics', label: '成绩统计', description: '统计分析成绩' }
    ]
  },
  {
    name: 'forum',
    label: '论坛管理',
    permissions: [
      { name: 'forum:manage', label: '论坛管理', description: '管理论坛' },
      { name: 'forum:post', label: '发布帖子', description: '发布论坛帖子' },
      { name: 'forum:reply', label: '回复帖子', description: '回复论坛帖子' },
      { name: 'forum:delete', label: '删除帖子', description: '删除论坛帖子' }
    ]
  },
  {
    name: 'system',
    label: '系统管理',
    permissions: [
      { name: 'system:settings', label: '系统设置', description: '修改系统设置' },
      { name: 'log:view', label: '查看日志', description: '查看系统日志' },
      { name: 'system:backup', label: '系统备份', description: '备份系统数据' }
    ]
  }
])

// 筛选和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showPermissionModal = ref(false)

// 表单数据
const newRole = ref({
  name: '',
  description: ''
})

const editRole = ref({
  id: '',
  name: '',
  description: ''
})

const selectedRole = ref({
  id: '',
  name: '',
  permissions: []
})

const selectedPermissions = ref([])

// 计算属性
const filteredRoles = computed(() => {
  let result = roles.value.filter(role => {
    return !searchKeyword.value || role.name.includes(searchKeyword.value)
  })
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const filteredCount = roles.value.filter(role => {
    return !searchKeyword.value || role.name.includes(searchKeyword.value)
  }).length
  return Math.ceil(filteredCount / pageSize.value)
})

// 方法
const resetFilters = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

const openAddRoleModal = () => {
  newRole.value = {
    name: '',
    description: ''
  }
  showAddModal.value = true
}

const openEditRoleModal = (role) => {
  editRole.value = { ...role }
  showEditModal.value = true
}

const openPermissionModal = (role) => {
  selectedRole.value = { ...role }
  selectedPermissions.value = [...role.permissions]
  showPermissionModal.value = true
}

const addRole = () => {
  const newId = Math.max(...roles.value.map(r => r.id)) + 1
  roles.value.push({
    id: newId,
    ...newRole.value,
    permissions: [],
    createdAt: new Date().toLocaleString()
  })
  showAddModal.value = false
  alert('角色添加成功')
}

const updateRole = () => {
  const index = roles.value.findIndex(r => r.id === editRole.value.id)
  if (index !== -1) {
    roles.value[index] = { ...editRole.value }
    showEditModal.value = false
    alert('角色更新成功')
  }
}

const deleteRole = (id) => {
  const role = roles.value.find(r => r.id === id)
  if (role.name === 'admin') {
    alert('管理员角色不能删除')
    return
  }
  
  if (confirm('确定要删除这个角色吗？')) {
    roles.value = roles.value.filter(r => r.id !== id)
    alert('角色删除成功')
  }
}

const savePermissions = () => {
  const index = roles.value.findIndex(r => r.id === selectedRole.value.id)
  if (index !== -1) {
    roles.value[index].permissions = [...selectedPermissions.value]
    showPermissionModal.value = false
    alert('权限保存成功')
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

.role-table {
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

.action-btn.permission {
  background: #e8f5e8;
  color: #4caf50;
}

.action-btn.permission:hover {
  background: #c8e6c9;
}

.action-btn.delete {
  background: #ffebee;
  color: #f44336;
}

.action-btn.delete:hover:not(:disabled) {
  background: #ffcdd2;
}

.action-btn.delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.permission-modal {
  max-width: 800px;
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

.permission-groups {
  margin-bottom: 20px;
}

.permission-group {
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.permission-group h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f5f7fa;
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3a;
  border-bottom: 1px solid #f0f0f0;
}

.permission-items {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.permission-item:hover {
  background: #f5f9ff;
}

.permission-item input[type="checkbox"] {
  margin-top: 2px;
}

.permission-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a2a3a;
}

.permission-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
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

  .form-input {
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

  .permission-items {
    grid-template-columns: 1fr;
  }
}
</style>