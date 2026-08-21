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
        <div class="group-area">
          <button class="group-btn" @click="showGroupModal = true">
            <Users :size="14" />
            <span>{{ groupInfo ? groupInfo.name : '그룹 참여' }}</span>
          </button>
        </div>
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

    <!-- 그룹 모달 -->
    <div v-if="showGroupModal" class="modal-overlay" @click.self="showGroupModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>그룹 관리</h3>
          <button class="modal-close" @click="showGroupModal = false"><X :size="18" /></button>
        </div>

        <!-- 그룹 있을 때 -->
        <div v-if="groupInfo" class="modal-body">
          <div class="group-detail">
            <div class="group-name-row">
              <Users :size="20" color="var(--toss-blue)" />
              <h4>{{ groupInfo.name }}</h4>
            </div>
            <div class="invite-code-row">
              <span class="invite-label">초대코드</span>
              <code class="invite-code">{{ groupInfo.invite_code }}</code>
              <button class="copy-btn" @click="copyCode">
                <Copy :size="14" />
              </button>
            </div>
          </div>
          <div class="member-list">
            <p class="member-title">멤버 ({{ groupMembers.length }}명)</p>
            <div class="member-item" v-for="m in groupMembers" :key="m.id">
              <User :size="14" />
              <span>{{ m.nickname }}</span>
              <span v-if="m.id === auth.user?.id" class="me-badge">나</span>
            </div>
          </div>
          <button v-if="!showLeaveConfirm" class="leave-btn" @click="showLeaveConfirm = true">그룹 나가기</button>
          <div v-else class="leave-confirm">
            <span>정말 나가시겠습니까?</span>
            <div class="leave-confirm-btns">
              <button class="action-btn cancel" @click="showLeaveConfirm = false">취소</button>
              <button class="action-btn danger" @click="leaveGroup">나가기</button>
            </div>
          </div>
        </div>

        <!-- 그룹 없을 때 -->
        <div v-else class="modal-body">
          <div class="no-group">
            <p>소속된 그룹이 없습니다</p>
          </div>
          <div class="group-actions">
            <div class="input-group-sm">
              <label>초대코드로 참여</label>
              <div class="input-row">
                <input v-model="joinCode" placeholder="초대코드 입력" />
                <button class="action-btn blue" @click="joinGroup">참여</button>
              </div>
            </div>
            <div class="divider-text"><span>또는</span></div>
            <div class="input-group-sm">
              <label>새 그룹 만들기</label>
              <div class="input-row">
                <input v-model="newGroupName" placeholder="그룹 이름" />
                <button class="action-btn blue" @click="createGroup">만들기</button>
              </div>
            </div>
          </div>
          <div v-if="groupError" class="group-error">{{ groupError }}</div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
import api from '../api';
import { Code, LayoutDashboard, FileCode, BookOpen, Brain, User, Users, LogOut, X, Copy } from '@lucide/vue';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const showGroupModal = ref(false);
const showLeaveConfirm = ref(false);
const groupInfo = ref(null);
const groupMembers = ref([]);
const joinCode = ref('');
const newGroupName = ref('');
const groupError = ref('');

async function loadGroup() {
  try {
    const { data } = await api.get('/auth/group');
    groupInfo.value = data.group;
    groupMembers.value = data.members;
  } catch (err) {
    console.error('그룹 로드 실패:', err);
  }
}

async function joinGroup() {
  groupError.value = '';
  try {
    await api.post('/auth/group/join', { inviteCode: joinCode.value });
    joinCode.value = '';
    await loadGroup();
    toast.success('그룹에 참여했습니다');
  } catch (err) {
    groupError.value = err.response?.data?.message || '참여에 실패했습니다.';
  }
}

async function createGroup() {
  groupError.value = '';
  try {
    await api.post('/auth/group', { name: newGroupName.value });
    newGroupName.value = '';
    await loadGroup();
    toast.success('그룹이 생성되었습니다');
  } catch (err) {
    groupError.value = err.response?.data?.message || '생성에 실패했습니다.';
  }
}

async function leaveGroup() {
  try {
    await api.post('/auth/group/leave');
    groupInfo.value = null;
    groupMembers.value = [];
    showLeaveConfirm.value = false;
    toast.info('그룹에서 나왔습니다');
  } catch (err) {
    toast.error('그룹 나가기에 실패했습니다');
  }
}

function copyCode() {
  navigator.clipboard.writeText(groupInfo.value.invite_code);
  toast.success('초대코드가 복사되었습니다');
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}

onMounted(loadGroup);
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
  flex-wrap: nowrap;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
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
  gap: 5px;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--toss-gray-600);
  transition: all 0.15s ease;
  white-space: nowrap;
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
  gap: 8px;
  flex-shrink: 0;
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
  gap: 4px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
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

/* 그룹 버튼 */
.group-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--toss-blue);
  background: rgba(49, 130, 246, 0.08);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.group-btn:hover {
  background: rgba(49, 130, 246, 0.14);
}

/* 그룹 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--toss-gray-100);
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--toss-gray-400);
  padding: 4px;
  border-radius: 8px;
  display: flex;
}

.modal-close:hover {
  background: var(--toss-gray-100);
  color: var(--toss-gray-600);
}

.modal-body {
  padding: 16px 18px;
}

.group-detail {
  margin-bottom: 14px;
}

.group-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.group-name-row h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.invite-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--toss-gray-50);
  border-radius: 8px;
}

.invite-label {
  font-size: 12px;
  color: var(--toss-gray-500);
  font-weight: 500;
}

.invite-code {
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-blue);
  letter-spacing: 1px;
  font-family: 'D2Coding', monospace;
}

.copy-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--toss-gray-400);
  padding: 4px;
  border-radius: 6px;
  display: flex;
}

.copy-btn:hover {
  background: var(--toss-gray-200);
  color: var(--toss-gray-600);
}

.member-list {
  margin-bottom: 14px;
}

.member-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--toss-gray-500);
  margin-bottom: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--toss-gray-800);
}

.member-item + .member-item {
  margin-top: 2px;
}

.me-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--toss-blue);
  background: rgba(49, 130, 246, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
}

.leave-btn {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--toss-gray-200);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--toss-gray-500);
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.leave-btn:hover {
  border-color: var(--toss-red);
  color: var(--toss-red);
  background: rgba(240, 68, 82, 0.04);
}

.no-group {
  text-align: center;
  padding: 12px 0;
  color: var(--toss-gray-400);
  font-size: 13px;
  margin-bottom: 14px;
}

.group-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group-sm label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--toss-gray-700);
  margin-bottom: 5px;
}

.input-row {
  display: flex;
  gap: 6px;
}

.input-row input {
  flex: 1;
  padding: 8px 10px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--toss-gray-50);
  outline: none;
  transition: all 0.15s ease;
}

.input-row input:focus {
  border-color: var(--toss-blue);
  background: white;
}

.action-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.action-btn.blue {
  background: var(--toss-blue);
  color: white;
}

.action-btn.blue:hover {
  background: #1b64da;
}

.divider-text {
  text-align: center;
  position: relative;
  color: var(--toss-gray-400);
  font-size: 12px;
}

.divider-text::before,
.divider-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 20px);
  height: 1px;
  background: var(--toss-gray-200);
}

.divider-text::before { left: 0; }
.divider-text::after { right: 0; }

.leave-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(240, 68, 82, 0.04);
  border: 1px solid rgba(240, 68, 82, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: var(--toss-gray-700);
}

.leave-confirm-btns {
  display: flex;
  gap: 6px;
}

.action-btn.cancel {
  background: var(--toss-gray-100);
  color: var(--toss-gray-600);
}

.action-btn.cancel:hover {
  background: var(--toss-gray-200);
}

.action-btn.danger {
  background: var(--toss-red);
  color: white;
}

.action-btn.danger:hover {
  background: #d93644;
}

.group-error {
  margin-top: 12px;
  font-size: 13px;
  color: var(--toss-red);
  text-align: center;
  padding: 8px;
  background: rgba(240, 68, 82, 0.06);
  border-radius: 8px;
}
</style>
