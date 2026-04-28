<template>
  <div class="forget-password-wrapper">
    <div class="forget-password-container">
      <div class="forget-password-header">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          返回登录
        </button>
        <div class="logo">
          <div class="logo-icon"></div>
          <h1>数据库作业管理系统</h1>
        </div>
        <p class="subtitle">找回密码</p>
      </div>

      <div class="forget-password-form">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name" class="form-label">姓名</label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="form-input"
              placeholder="请输入您的姓名"
              required
            />
          </div>

          <div class="form-group">
            <label for="account" class="form-label">账号</label>
            <input
              type="text"
              id="account"
              v-model="form.account"
              class="form-input"
              placeholder="请输入您的账号"
              required
            />
          </div>

          <div class="form-group">
            <label for="idCard" class="form-label">身份证号</label>
            <input
              type="text"
              id="idCard"
              v-model="form.idCard"
              class="form-input"
              placeholder="请输入您的身份证号"
              required
            />
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">新密码</label>
            <input
              type="password"
              id="newPassword"
              v-model="form.newPassword"
              class="form-input"
              placeholder="请输入新密码"
              required
              minlength="6"
            />
            <p class="form-hint">密码长度至少6位</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="form-input"
              placeholder="请再次输入新密码"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            <span class="success-icon">✅</span>
            {{ success }}
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '提交中...' : '重置密码' }}
          </button>
        </form>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  account: '',
  idCard: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  // 验证密码
  if (form.value.newPassword.length < 6) {
    error.value = '密码长度至少6位'
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    const response = await authAPI.forgetPassword({
      name: form.value.name,
      account: form.value.account,
      idCard: form.value.idCard,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword
    })

    if (response.code === 200) {
      success.value = '密码重置成功，请使用新密码登录'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = response.message || '密码重置失败，请稍后重试'
    }
  } catch (err) {
    error.value = '密码重置失败，请稍后重试'
    console.error('Forget password error:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped>
.forget-password-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.forget-password-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.forget-password-container {
  max-width: 420px;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.2);
  border-radius: 24px;
  padding: 40px 45px;
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 10;
}

.forget-password-header {
  text-align: center;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #667eea;
}

.back-icon {
  font-size: 18px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 42px;
  margin-right: 12px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.forget-password-header h1 {
  color: #1a1a2e;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 16px 0 0;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafbfc;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin: 6px 0 0;
}

.error-message {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  color: #e53e3e;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  animation: shake 0.5s ease-in-out;
  border: 1px solid #fed7d7;
}

.error-icon {
  margin-right: 8px;
  font-size: 16px;
}

.success-message {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%);
  color: #38a169;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #c6f6d5;
}

.success-icon {
  margin-right: 8px;
  font-size: 16px;
}

.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  letter-spacing: 1px;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.5);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #a0a0a0 0%, #888 100%);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.contact-admin {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.contact-admin p {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
}

.admin-contact {
  font-size: 13px;
  color: #999;
}

@media (max-width: 480px) {
  .forget-password-container {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .logo-icon {
    font-size: 36px;
    margin-right: 8px;
  }

  .forget-password-header h1 {
    font-size: 20px;
  }

  .form-input {
    padding: 12px 14px;
    font-size: 14px;
  }

  .btn {
    padding: 14px;
    font-size: 15px;
  }
}
</style>