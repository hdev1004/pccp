<template>
  <div v-if="quiz">
    <router-link to="/quiz" class="back-link">
      <ArrowLeft :size="16" />
      <span>퀴즈 목록</span>
    </router-link>

    <div class="quiz-header">
      <h1>{{ quiz.week }}주차 시간복잡도 퀴즈</h1>
      <p v-if="!quiz.completed">{{ quiz.questions.length }}문제 · 각 문제의 시간복잡도를 선택하세요</p>
    </div>

    <!-- 이미 풀었을 때 -->
    <div v-if="quiz.completed">
      <!-- 내 점수 -->
      <div class="card score-card">
        <Trophy :size="28" color="var(--toss-blue)" />
        <p class="score-label">내 점수</p>
        <p class="score-value">
          {{ quiz.result.score }}
          <span class="score-total">/ {{ quiz.questions.length }}</span>
        </p>
      </div>

      <!-- 전체 결과 대시보드 -->
      <div class="card" v-if="dashboard">
        <h2 class="section-title">
          <BarChart3 :size="18" color="var(--toss-blue)" />
          전체 결과
        </h2>
        <div class="ranking-list">
          <div
            v-for="(result, index) in dashboard.results"
            :key="result.id"
            class="ranking-item"
            :class="{ first: index === 0 }"
          >
            <div class="ranking-left">
              <span class="ranking-num" :class="{ gold: index === 0 }">{{ index + 1 }}</span>
              <span class="ranking-name">{{ result.nickname }}</span>
            </div>
            <span class="ranking-score">{{ result.score }} / {{ dashboard.quiz.total }}</span>
          </div>
        </div>
      </div>

      <!-- 문제별 정답 확인 -->
      <div v-for="(q, idx) in quiz.questions" :key="q.id" class="card question-card">
        <div class="question-top">
          <span class="badge" :class="quiz.result.answers[idx] === q.answer ? 'badge-green' : 'badge-red'">
            {{ quiz.result.answers[idx] === q.answer ? '정답' : '오답' }}
          </span>
          <span class="question-num">문제 {{ idx + 1 }}</span>
        </div>
        <CodeBlock :code="q.code" />
        <div class="options-grid">
          <div
            v-for="(option, optIdx) in q.options"
            :key="optIdx"
            class="option-result"
            :class="{
              correct: optIdx === q.answer,
              wrong: optIdx === quiz.result.answers[idx] && optIdx !== q.answer,
            }"
          >{{ option }}</div>
        </div>
        <div class="explanation">
          <Lightbulb :size="15" color="var(--toss-blue)" />
          <span>{{ q.explanation }}</span>
        </div>
      </div>
    </div>

    <!-- 퀴즈 풀기 -->
    <div v-else>
      <div v-for="(q, idx) in quiz.questions" :key="q.id" class="card question-card">
        <p class="question-label">문제 {{ idx + 1 }}</p>
        <CodeBlock :code="q.code" />
        <div class="options-grid">
          <button
            v-for="(option, optIdx) in q.options"
            :key="optIdx"
            @click="answers[idx] = optIdx"
            class="option-btn"
            :class="{ selected: answers[idx] === optIdx }"
          >{{ option }}</button>
        </div>
      </div>

      <div class="submit-area">
        <button
          @click="submitQuiz"
          class="btn btn-primary submit-quiz-btn"
          :disabled="submitting || !allAnswered"
        >
          <Loader2 v-if="submitting" :size="18" class="spin" />
          {{ submitting ? '제출 중...' : '제출하기' }}
        </button>
        <p v-if="!allAnswered" class="submit-hint">모든 문제를 풀어주세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { ArrowLeft, Lightbulb, Trophy, BarChart3, Loader2 } from '@lucide/vue';
import CodeBlock from '../components/CodeBlock.vue';

const route = useRoute();
const quiz = ref(null);
const dashboard = ref(null);
const answers = ref([]);
const submitting = ref(false);

const allAnswered = computed(() => {
  if (!quiz.value) return false;
  return quiz.value.questions.every((_, idx) => answers.value[idx] !== undefined);
});

async function loadQuiz() {
  try {
    const { data } = await api.get(`/quiz/${route.params.id}`);
    quiz.value = data;
    answers.value = new Array(data.questions.length).fill(undefined);
    if (data.completed) {
      const dashRes = await api.get(`/quiz/${route.params.id}/dashboard`);
      dashboard.value = dashRes.data;
    }
  } catch (err) {
    console.error('퀴즈 로드 실패:', err);
  }
}

async function submitQuiz() {
  submitting.value = true;
  try {
    await api.post(`/quiz/${route.params.id}/submit`, { answers: answers.value });
    await loadQuiz();
  } catch (err) {
    console.error('퀴즈 제출 실패:', err);
  } finally {
    submitting.value = false;
  }
}

onMounted(loadQuiz);
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-bottom: 16px;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--toss-blue);
}

.quiz-header {
  margin-bottom: 24px;
}

.quiz-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.quiz-header p {
  color: var(--toss-gray-500);
  font-size: 14px;
  margin-top: 4px;
}

/* 점수 카드 */
.score-card {
  text-align: center;
  padding: 32px;
}

.score-label {
  font-size: 14px;
  color: var(--toss-gray-500);
  margin-top: 8px;
}

.score-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--toss-blue);
  margin-top: 4px;
}

.score-total {
  font-size: 20px;
  font-weight: 500;
  color: var(--toss-gray-400);
}

/* 섹션 타이틀 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 16px;
}

/* 랭킹 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--toss-gray-50);
}

.ranking-item.first {
  background: #fffbeb;
}

.ranking-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-num {
  font-size: 16px;
  font-weight: 700;
  width: 28px;
  text-align: center;
  color: var(--toss-gray-400);
}

.ranking-num.gold {
  color: var(--toss-yellow);
}

.ranking-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.ranking-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-blue);
}

/* 문제 카드 */
.question-card {
  margin-top: 14px;
}

.question-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.question-num {
  font-size: 15px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.question-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-blue);
  margin-bottom: 14px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
}

.option-btn {
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid var(--toss-gray-200);
  background: white;
  color: var(--toss-gray-700);
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-btn:hover {
  background: var(--toss-gray-50);
  border-color: var(--toss-gray-300);
}

.option-btn.selected {
  background: var(--toss-blue);
  color: white;
  border-color: var(--toss-blue);
}

.option-result {
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  background: var(--toss-gray-50);
  color: var(--toss-gray-500);
  border: 1.5px solid transparent;
}

.option-result.correct {
  background: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}

.option-result.wrong {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}

.explanation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 13px;
  color: var(--toss-gray-700);
  line-height: 1.5;
}

/* 제출 영역 */
.submit-area {
  text-align: center;
  margin-top: 28px;
  padding-bottom: 24px;
}

.submit-quiz-btn {
  padding: 14px 48px;
  font-size: 16px;
  border-radius: 14px;
}

.submit-hint {
  font-size: 13px;
  color: var(--toss-gray-400);
  margin-top: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
