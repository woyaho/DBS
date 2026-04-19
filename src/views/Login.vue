<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon"></div>
          <h1>数据库作业管理系统</h1>
        </div>
        <p class="slogan">智能管理，高效学习</p>
      </div>

      <div class="login-form">
        <h2>用户登录</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                id="username"
                v-model="username"
                placeholder="请输入用户名"
                class="form-input"
                :class="{ 'input-focused': isUsernameFocused }"
                @focus="isUsernameFocused = true"
                @blur="isUsernameFocused = false"
              />
            </div>
          </div>
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="请输入密码"
                class="form-input"
                :class="{ 'input-focused': isPasswordFocused }"
                @focus="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
              />
              <span class="password-toggle" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </span>
            </div>
          </div>
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>



      </div>
    </div>
    <div class="decorative-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const login = async () => {
  // 简单验证
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟登录验证
    const validAccounts = {
      'student': { role: 'student', name: '学生用户' },
      'teacher': { role: 'teacher', name: '教师用户' },
      'admin': { role: 'admin', name: '管理员用户' }
    }

    if (validAccounts[username.value] && password.value === '123456') {
      // 登录成功，存储用户信息
      const userInfo = {
        ...validAccounts[username.value],
        username: username.value
      }
      localStorage.setItem('user', JSON.stringify(userInfo))

      // 根据用户角色跳转到对应页面
      if (userInfo.role === 'student') {
        router.push('/student/dashboard')
      } else if (userInfo.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else if (userInfo.role === 'admin') {
        router.push('/admin/dashboard')
      }
    } else {
      error.value = '用户名或密码错误'
    }
  } catch (err) {
    error.value = '登录失败，请稍后重试'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-wrapper::before {
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

.login-container {
  max-width: 420px;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.2);
  border-radius: 24px;
  padding: 50px 45px;
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    white-space: nowrap;
  }

  .logo-icon {
    font-size: 42px;
    margin-right: 12px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  }

  .login-header h1 {
    color: #1a1a2e;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }

.slogan {
  color: #666;
  font-size: 14px;
  margin: 12px 0 0;
  font-weight: 500;
  letter-spacing: 2px;
}

.login-form h2 {
  text-align: center;
  color: #333;
  font-size: 20px;
  margin-bottom: 30px;
  font-weight: 600;
  position: relative;
}

.login-form h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 12px auto 0;
  border-radius: 2px;
}

.form-group {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.input-wrapper:hover {
  box-shadow: 0 2px 15px rgba(102, 126, 234, 0.15);
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  transition: all 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 16px 18px 16px 50px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.form-input.input-focused + .input-icon {
  transform: translateY(-50%) scale(1.15);
}

.error-message {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  color: #e53e3e;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  animation: shake 0.5s ease-in-out;
  border: 1px solid #fed7d7;
}

.error-icon {
  margin-right: 10px;
  font-size: 18px;
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
}

.btn-loading {
  opacity: 0.9;
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

.password-toggle {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  transform: translateY(-50%) scale(1.15);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #555;
  font-weight: 500;
}

.remember-me input[type="checkbox"] {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #667eea;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #764ba2;
  text-decoration: underline;
}

.register-link {
  text-align: center;
  margin-top: 28px;
  padding-top: 25px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.decorative-circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(5px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -80px;
  animation: float 20s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: -60px;
  animation: float 15s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: -40px;
  animation: float 18s ease-in-out infinite 2s;
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

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

@media (max-width: 480px) {
  .login-container {
    padding: 40px 25px;
    border-radius: 20px;
  }

  .login-header h1 {
    font-size: 22px;
  }

  .logo-icon {
    font-size: 40px;
  }

  .form-input {
    padding: 14px 16px 14px 45px;
    font-size: 14px;
  }

  .btn {
    padding: 14px;
    font-size: 15px;
  }
}
</style>
