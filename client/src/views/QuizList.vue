<template>
  <!-- 스켈레톤 -->
  <div v-if="loading">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div class="sk" style="width:160px;height:22px"></div>
      <div class="sk" style="width:180px;height:36px;border-radius:12px"></div>
    </div>
    <div v-for="i in 3" :key="i" class="sk-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div class="sk" style="width:140px;height:16px;margin-bottom:6px"></div>
          <div class="sk" style="width:100px;height:13px"></div>
        </div>
        <div class="sk" style="width:48px;height:22px;border-radius:8px"></div>
      </div>
    </div>
  </div>

  <div v-else class="fade-in">
    <div class="page-header">
      <h1>시간복잡도 퀴즈</h1>
      <div class="header-actions">
        <div class="week-selector">
          <label>주차:</label>
          <input v-model.number="targetWeek" type="number" min="1" class="week-input" />
        </div>
        <button @click="handleGenerate" class="btn btn-secondary" :disabled="generating">
          <Sparkles :size="15" />
          {{ generating ? '생성 중...' : '퀴즈 생성' }}
        </button>
      </div>
    </div>

    <div v-if="successMsg" class="success-banner">
      <CheckCircle :size="15" />
      <span>{{ successMsg }}</span>
    </div>

    <div v-if="error" class="error-banner">
      <AlertCircle :size="15" />
      <span>{{ error }}</span>
    </div>

    <div v-if="quizzes.length === 0" class="card empty">아직 생성된 퀴즈가 없습니다</div>
    <div v-else class="quiz-list">
      <div v-for="quiz in quizzes" :key="quiz.id" class="card quiz-item">
        <router-link :to="`/quiz/${quiz.id}`" class="quiz-link">
          <div class="quiz-info">
            <div class="quiz-title-row">
              <Brain :size="18" color="var(--toss-blue)" />
              <h3>{{ quiz.week }}주차 퀴즈</h3>
            </div>
            <p class="quiz-meta">{{ formatDate(quiz.created_at) }} · {{ quiz.participant_count }}명 참여</p>
          </div>
          <div class="quiz-status">
            <span class="badge" :class="quiz.completed ? 'badge-green' : 'badge-blue'">
              {{ quiz.completed ? '완료' : '풀기' }}
            </span>
          </div>
        </router-link>
        <button @click.stop="handleDelete(quiz)" class="delete-btn" title="삭제">
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <!-- 확인 모달 -->
    <div v-if="confirmModal" class="modal-overlay" @click.self="confirmModal = null">
      <div class="modal-card">
        <h3>{{ confirmModal.title }}</h3>
        <p>{{ confirmModal.message }}</p>
        <div class="modal-actions">
          <button @click="confirmModal = null" class="btn btn-secondary">취소</button>
          <button @click="confirmModal.action()" class="btn" :class="confirmModal.danger ? 'btn-danger' : 'btn-primary'">
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { Sparkles, AlertCircle, CheckCircle, Brain, ChevronRight, Trash2 } from '@lucide/vue';

const loading = ref(true);

const quizzes = ref([]);
const generating = ref(false);
const error = ref('');
const successMsg = ref('');
const confirmModal = ref(null);
const targetWeek = ref(1);

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadQuizzes() {
  try {
    const { data } = await api.get('/quiz');
    quizzes.value = data;
    if (data.length > 0) {
      targetWeek.value = Math.max(...data.map(q => q.week)) + 1;
    }
  } catch (err) {
    console.error('퀴즈 목록 로드 실패:', err);
  } finally {
    loading.value = false;
  }
}

function handleGenerate() {
  const week = targetWeek.value;
  const existing = quizzes.value.find(q => q.week === week);

  if (existing) {
    confirmModal.value = {
      title: `${week}주차 퀴즈 덮어쓰기`,
      message: `${week}주차 퀴즈가 이미 존재합니다. 덮어쓰면 기존 퀴즈 결과가 모두 삭제됩니다.`,
      confirmText: '덮어쓰기',
      danger: true,
      action: () => { confirmModal.value = null; doGenerate(week); },
    };
  } else {
    doGenerate(week);
  }
}

async function doGenerate(week) {
  generating.value = true;
  error.value = '';
  successMsg.value = '';
  try {
    const { data } = await api.post('/quiz/generate', { week });
    await loadQuizzes();
    successMsg.value = data.overwritten
      ? `${data.week}주차 퀴즈를 덮어썼습니다.`
      : `${data.week}주차 퀴즈가 생성되었습니다.`;
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || '퀴즈 생성에 실패했습니다.';
  } finally {
    generating.value = false;
  }
}

function handleDelete(quiz) {
  confirmModal.value = {
    title: `${quiz.week}주차 퀴즈 삭제`,
    message: `${quiz.week}주차 퀴즈와 모든 참여 결과가 삭제됩니다. 되돌릴 수 없습니다.`,
    confirmText: '삭제',
    danger: true,
    action: () => { confirmModal.value = null; doDelete(quiz.id); },
  };
}

async function doDelete(quizId) {
  error.value = '';
  successMsg.value = '';
  try {
    await api.delete(`/quiz/${quizId}`);
    await loadQuizzes();
    successMsg.value = '퀴즈가 삭제되었습니다.';
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || '퀴즈 삭제에 실패했습니다.';
  }
}

onMounted(loadQuizzes);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.week-selector label {
  font-size: 13px;
  font-weight: 600;
  color: var(--toss-gray-600);
}

.week-input {
  width: 60px;
  padding: 7px 10px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  text-align: center;
  background: var(--toss-gray-50);
  color: var(--toss-gray-900);
  outline: none;
}

.week-input:focus {
  border-color: var(--toss-blue);
  background: white;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(48,176,110,0.08);
  color: var(--toss-green);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(240,68,82,0.06);
  color: var(--toss-red);
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 16px;
}

.empty {
  text-align: center;
  padding: 48px 0;
  color: var(--toss-gray-400);
  font-size: 14px;
}

.quiz-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px !important;
}

.quiz-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.quiz-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.quiz-title-row h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.quiz-meta {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-left: 26px;
}

.quiz-status {
  flex-shrink: 0;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--toss-gray-400);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(240,68,82,0.08);
  color: var(--toss-red);
}

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.modal-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 10px;
}

.modal-card p {
  font-size: 14px;
  color: var(--toss-gray-600);
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-danger {
  background: var(--toss-red);
  color: white;
}

.btn-danger:hover {
  background: #d93843;
}
</style>
