<template>
  <div class="register-wrapper">
    <div class="register-container">
      <!-- 로고 영역 -->
      <div class="logo-area">
        <div class="logo-icon">
          <UserPlus :size="28" color="white" :stroke-width="2.5" />
        </div>
        <h1 class="logo-title">회원가입</h1>
        <p class="logo-desc">PCCP 스터디에 참여하세요</p>
      </div>

      <!-- 폼 카드 -->
      <div class="register-card">
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label>아이디</label>
            <div class="input-wrap">
              <UserIcon :size="18" class="input-icon" />
              <input
                v-model="username"
                type="text"
                placeholder="아이디를 입력하세요"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="input-group">
            <label>닉네임</label>
            <div class="input-wrap">
              <Smile :size="18" class="input-icon" />
              <input
                v-model="nickname"
                type="text"
                placeholder="표시될 이름을 입력하세요"
              />
            </div>
          </div>

          <div class="input-group">
            <label>비밀번호</label>
            <div class="input-wrap">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="input-group">
            <label>비밀번호 확인</label>
            <div class="input-wrap">
              <ShieldCheck :size="18" class="input-icon" />
              <input
                v-model="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div v-if="error" class="error-msg">
            <AlertCircle :size="15" />
            <span>{{ error }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <span>{{ loading ? '가입 중' : '가입하기' }}</span>
          </button>
        </form>
      </div>

      <!-- 하단 링크 -->
      <div class="bottom-link">
        <span>이미 계정이 있으신가요?</span>
        <router-link to="/login">로그인</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { UserPlus, User as UserIcon, Smile, Lock, ShieldCheck, AlertCircle, Loader2 } from '@lucide/vue';

const router = useRouter();

const username = ref('');
const nickname = ref('');
const password = ref('');
const passwordConfirm = ref('');
const error = ref('');
const loading = ref(false);

async function handleRegister() {
  error.value = '';

  if (password.value !== passwordConfirm.value) {
    error.value = '비밀번호가 일치하지 않습니다.';
    return;
  }

  if (password.value.length < 4) {
    error.value = '비밀번호는 4자 이상이어야 합니다.';
    return;
  }

  loading.value = true;

  try {
    await api.post('/auth/register', {
      username: username.value,
      password: password.value,
      nickname: nickname.value,
    });
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.message || '회원가입에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #f9fafb 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 380px;
}

.logo-area {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #3182f6 0%, #1b64da 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.3);
}

.logo-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--toss-gray-900);
  letter-spacing: -0.5px;
}

.logo-desc {
  font-size: 15px;
  color: var(--toss-gray-500);
  margin-top: 4px;
}

.register-card {
  background: white;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.06);
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--toss-gray-700);
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--toss-gray-400);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 13px 14px 13px 42px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  background: var(--toss-gray-50);
  color: var(--toss-gray-900);
  outline: none;
  transition: all 0.2s ease;
}

.input-wrap input:focus {
  border-color: var(--toss-blue);
  background: white;
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.08);
}

.input-wrap input::placeholder {
  color: var(--toss-gray-400);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--toss-red);
  margin-bottom: 16px;
  padding: 10px 12px;
  background: rgba(240, 68, 82, 0.06);
  border-radius: 10px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  color: white;
  background: linear-gradient(135deg, #3182f6 0%, #1b64da 100%);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.35);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.bottom-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--toss-gray-500);
}

.bottom-link a {
  color: var(--toss-blue);
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
}

.bottom-link a:hover {
  text-decoration: underline;
}
</style>
