<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <div class="navbar-left">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <Code :size="16" color="white" />
          </div>
          <span>PCCP 스터디</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <LayoutDashboard :size="16" />
            <span>대시보드</span>
          </router-link>
          <router-link to="/problems" class="nav-link" :class="{ active: $route.path.startsWith('/problems') }">
            <FileCode :size="16" />
            <span>문제 풀이</span>
          </router-link>
          <router-link to="/wiki" class="nav-link" :class="{ active: $route.path.startsWith('/wiki') }">
            <BookOpen :size="16" />
            <span>알고리즘 위키</span>
          </router-link>
          <router-link to="/quiz" class="nav-link" :class="{ active: $route.path.startsWith('/quiz') }">
            <Brain :size="16" />
            <span>시간복잡도 퀴즈</span>
          </router-link>
        </div>
      </div>
      <div class="navbar-right">
        <div class="user-info">
          <User :size="15" />
          <span>{{ auth.user?.nickname }}</span>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="14" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { Code, LayoutDashboard, FileCode, BookOpen, Brain, User, LogOut } from '@lucide/vue';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid var(--toss-gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  color: var(--toss-gray-900);
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3182f6, #1b64da);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--toss-gray-600);
  transition: all 0.15s ease;
}

.nav-link:hover {
  background: var(--toss-gray-100);
  color: var(--toss-gray-900);
}

.nav-link.active {
  background: rgba(49,130,246,0.08);
  color: var(--toss-blue);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--toss-gray-600);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--toss-gray-600);
  background: var(--toss-gray-100);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background: var(--toss-gray-200);
  color: var(--toss-gray-800);
}
</style>
