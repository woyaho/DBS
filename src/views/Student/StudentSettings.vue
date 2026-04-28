<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <StudentHeader />
    
    <div class="content-container">
      <StudentSidebar />
      <div class="content-area">
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
                    <a href="/forget-password" class="forgot-password-link">忘记密码？</a>
                  </div>
                </div>
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
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'

const userInfo = ref({
  username: 'student',
  nickname: '',
  realName: '',
  studentId: '20210001',
  email: '',
  emailVerified: false,
  phone: '',
  phoneVerified: false
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')

const notificationSettings = ref({
  homework: true,
  grade: true,
  forum: true,
  system: true
})

const feedback = ref({
  type: '',
  content: '',
  contact: ''
})

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

const canSubmitFeedback = computed(() => {
  return feedback.value.type && feedback.value.content.trim()
})

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userInfo.value.username = userData.username || 'student'
    userInfo.value.nickname = userData.name || ''
  }
})

const verifyEmail = () => {
  if (!userInfo.value.email) {
    alert('请先输入邮箱地址')
    return
  }
  alert('验证邮件已发送，请查收')
}

const verifyPhone = () => {
  if (!userInfo.value.phone) {
    alert('请先输入手机号')
    return
  }
  alert('验证码已发送，请查收')
}

const saveProfile = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userData.name = userInfo.value.nickname
    localStorage.setItem('user', JSON.stringify(userData))
  }
  alert('个人信息保存成功！')
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }
  passwordError.value = ''
  
  try {
    const response = await authAPI.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })
    
    if (response.code === 200) {
      alert('密码修改成功！')
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      passwordError.value = response.message || '密码修改失败'
    }
  } catch (error) {
    passwordError.value = '密码修改失败，请检查当前密码是否正确'
    console.error('修改密码失败:', error)
  }
}

const submitFeedback = () => {
  alert('感谢您的反馈，我们会尽快处理！')
  feedback.value = { type: '', content: '', contact: '' }
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

.settings-container {
  max-width: 100%;
  margin: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

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

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 12px;
  color: #999;
}

.error-text {
  font-size: 12px;
  color: #ff4d4f;
}

.input-with-action {
  display: flex;
  gap: 12px;
}

.input-with-action .form-input {
  flex: 1;
}

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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password-link {
  font-size: 14px;
  color: #1E88E5;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password-link:hover {
  color: #1976D2;
  text-decoration: underline;
}

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

.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
}

.setting-info p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1E88E5;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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