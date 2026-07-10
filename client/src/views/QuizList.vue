<template>
  <div>
    <div class="page-header">
      <h1>시간복잡도 퀴즈</h1>
      <button @click="generateQuiz" class="btn btn-secondary" :disabled="generating">
        <Sparkles :size="15" />
        {{ generating ? '생성 중...' : '퀴즈 생성' }}
      </button>
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
      <router-link
        v-for="quiz in quizzes"
        :key="quiz.id"
        :to="`/quiz/${quiz.id}`"
        class="card quiz-item"
      >
        <div class="quiz-info">
          <div class="quiz-title-row">
            <Brain :size="18" color="var(--toss-blue)" />
            <h3>{{ quiz.week }}주차 퀴즈</h3>
          </div>
          <p class="quiz-meta">{{ formatDate(quiz.created_at) }} · {{ quiz.participant_count }}명 참여</p>
        </div>
        <div class="quiz-right">
          <span class="badge" :class="quiz.completed ? 'badge-green' : 'badge-blue'">
            {{ quiz.completed ? '완료' : '풀기' }}
          </span>
          <ChevronRight :size="18" color="var(--toss-gray-400)" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { Sparkles, AlertCircle, CheckCircle, Brain, ChevronRight } from '@lucide/vue';

const quizzes = ref([]);
const generating = ref(false);
const error = ref('');
const successMsg = ref('');

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadQuizzes() {
  try {
    const { data } = await api.get('/quiz');
    quizzes.value = data;
  } catch (err) {
    console.error('퀴즈 목록 로드 실패:', err);
  }
}

async function generateQuiz() {
  // 다음 주차 확인해서 이미 존재하면 덮어쓰기 확인
  const nextWeek = quizzes.value.length > 0 ? Math.max(...quizzes.value.map(q => q.week)) + 1 : 1;
  const existing = quizzes.value.find(q => q.week === nextWeek);

  if (existing) {
    if (!confirm(`${nextWeek}주차 퀴즈가 이미 존재합니다.\n덮어쓰시겠습니까? (기존 결과가 삭제됩니다)`)) {
      return;
    }
  }

  generating.value = true;
  error.value = '';
  successMsg.value = '';
  try {
    const { data } = await api.post('/quiz/generate');
    await loadQuizzes();
    if (data.overwritten) {
      successMsg.value = `${data.week}주차 퀴즈를 덮어썼습니다.`;
    } else {
      successMsg.value = `${data.week}주차 퀴즈가 생성되었습니다.`;
    }
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || '퀴즈 생성에 실패했습니다.';
  } finally {
    generating.value = false;
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
  justify-content: space-between;
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

.quiz-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
</style>
