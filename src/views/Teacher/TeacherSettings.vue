<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <TeacherSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <TeacherHeader />

      <main class="main-content">
        <div class="settings-container">
          <!-- 页面标题 -->
          <div class="page-header">
            <h1 class="page-title">设置</h1>
          </div>

          <!-- 设置内容 -->
          <div class="settings-content">
            <!-- 个人信息设置 -->
            <div class="settings-section">
              <h2 class="section-title">个人信息</h2>
              <div class="settings-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>用户名</label>
                    <input type="text" v-model="userInfo.username" disabled class="form-input disabled" />
                    <span class="form-hint">用户名不可修改</span>
                  </div>
                  <div class="form-group">
                    <label>昵称</label>
                    <input type="text" v-model="userInfo.nickname" class="form-input" placeholder="请输入昵称" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>邮箱</label>
                    <div class="input-with-action">
                      <input type="email" v-model="userInfo.email" class="form-input" placeholder="请输入邮箱" />
                      <button class="btn btn-sm" :class="userInfo.emailVerified ? 'btn-success' : 'btn-primary'" @click="verifyEmail">
                        {{ userInfo.emailVerified ? '已验证' : '验证' }}
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>手机号</label>
                    <div class="input-with-action">
                      <input type="tel" v-model="userInfo.phone" class="form-input" placeholder="请输入手机号" />
                      <button class="btn btn-sm" :class="userInfo.phoneVerified ? 'btn-success' : 'btn-primary'" @click="verifyPhone">
                        {{ userInfo.phoneVerified ? '已绑定' : '绑定' }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary" @click="saveProfile">保存修改</button>
                </div>
              </div>
            </div>

            <!-- 密码修改 -->
            <div class="settings-section">
              <h2 class="section-title">修改密码</h2>
              <div class="settings-form">
                <div class="form-group">
                  <label>当前密码</label>
                  <input type="password" v-model="passwordForm.oldPassword" class="form-input" placeholder="请输入当前密码" />
                </div>
                <div class="form-group">
                  <label>新密码</label>
                  <input type="password" v-model="passwordForm.newPassword" class="form-input" placeholder="请输入新密码（6-20位字符）" />
                  <div class="password-strength" v-if="passwordForm.newPassword">
                    <span class="strength-label">密码强度：</span>
                    <div class="strength-bar">
                      <div class="strength-fill" :style="{ width: passwordStrength + '%', backgroundColor: strengthColor }"></div>
                    </div>
                    <span class="strength-text" :style="{ color: strengthColor }">{{ strengthText }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>确认新密码</label>
                  <input type="password" v-model="passwordForm.confirmPassword" class="form-input" placeholder="请再次输入新密码" />
                  <span class="error-text" v-if="passwordError">{{ passwordError }}</span>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary" @click="changePassword" :disabled="!canChangePassword">修改密码</button>
                </div>
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
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'

// 用户信息
const userInfo = ref({
  username: 'teacher',
  nickname: '',
  email: '',
  emailVerified: false,
  phone: '',
  phoneVerified: false
})

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = passwordForm.value.newPassword
  if (!pwd) return 0
  
  let strength = 0
  if (pwd.length >= 6) strength += 20
  if (pwd.length >= 10) strength += 20
  if (/[a-z]/.test(pwd)) strength += 15
  if (/[A-Z]/.test(pwd)) strength += 15
  if (/[0-9]/.test(pwd)) strength += 15
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15
  
  return Math.min(strength, 100)
})

const strengthText = computed(() => {
  if (passwordStrength.value < 40) return '弱'
  if (passwordStrength.value < 70) return '中'
  return '强'
})

const strengthColor = computed(() => {
  if (passwordStrength.value < 40) return '#ff4d4f'
  if (passwordStrength.value < 70) return '#faad14'
  return '#52c41a'
})

const canChangePassword = computed(() => {
  return passwordForm.value.oldPassword && 
         passwordForm.value.newPassword && 
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6 &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

onMounted(() => {
  // 从localStorage获取用户信息
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userInfo.value.username = userData.username || 'teacher'
    userInfo.value.nickname = userData.name || ''
  }
})

// 验证邮箱
const verifyEmail = () => {
  if (!userInfo.value.email) {
    alert('请先输入邮箱地址')
    return
  }
  alert('验证邮件已发送，请查收')
}

// 验证手机
const verifyPhone = () => {
  if (!userInfo.value.phone) {
    alert('请先输入手机号')
    return
  }
  alert('验证码已发送，请查收')
}

// 保存个人信息
const saveProfile = () => {
  // 保存到localStorage
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userData.name = userInfo.value.nickname
    localStorage.setItem('user', JSON.stringify(userData))
  }
  alert('个人信息保存成功！')
}

// 修改密码
const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }
  passwordError.value = ''
  alert('密码修改成功！')
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
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

.settings-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

/* 设置内容 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 设置区块 */
.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

/* 表单样式 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input.disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: #999;
}

.error-text {
  font-size: 12px;
  color: #ff4d4f;
}

/* 带按钮的输入框 */
.input-with-action {
  display: flex;
  gap: 12px;
}

.input-with-action .form-input {
  flex: 1;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-sm {
  padding: 6px 16px;
  font-size: 13px;
  white-space: nowrap;
}

.btn-primary {
  background: #1E88E5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976D2;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.btn-success:hover {
  background: #73d13d;
}

.form-actions {
  margin-top: 10px;
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.strength-label {
  font-size: 12px;
  color: #666;
}

.strength-bar {
  width: 100px;
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
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
  
  .page-title {
    font-size: 24px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .settings-section {
    padding: 16px;
  }
}
</style>