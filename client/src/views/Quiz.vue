<template>
  <div v-if="quiz">
    <router-link to="/quiz" class="back-link">
      <ArrowLeft :size="16" />
      <span>퀴즈 목록</span>
    </router-link>

    <div class="quiz-header">
      <h1>{{ quiz.week }}주차 시간복잡도 퀴즈</h1>
      <p v-if="!quiz.completed">{{ quiz.questions.length }}문제 · 객관식 {{ choiceCount }}개, 단답형 {{ shortAnswerCount }}개, 서술형 {{ descriptiveCount }}개</p>
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
          <span class="badge" :class="getResultBadge(q, idx)">
            {{ getResultLabel(q, idx) }}
          </span>
          <span class="question-num">문제 {{ idx + 1 }}</span>
          <span class="question-type-badge" :class="'type-' + (q.type || 'choice')">
            {{ { choice: '객관식', short_answer: '단답형', descriptive: '서술형' }[q.type || 'choice'] }}
          </span>
        </div>

        <!-- 서술형: 복잡도 표시 -->
        <div v-if="q.type === 'descriptive'" class="complexity-badge">
          시간복잡도: <strong>{{ q.complexity }}</strong>
        </div>

        <CodeBlock :code="q.code" />

        <!-- 객관식 결과 -->
        <div v-if="!q.type || q.type === 'choice'" class="options-grid">
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

        <!-- 단답형 결과 -->
        <div v-else-if="q.type === 'short_answer'" class="text-answer-result">
          <div class="answer-row">
            <span class="answer-label">내 답안</span>
            <span class="answer-value">{{ quiz.result.answers[idx] || '(미작성)' }}</span>
          </div>
          <div class="answer-row">
            <span class="answer-label">정답</span>
            <span class="answer-value correct-answer">{{ q.answer }}</span>
          </div>
        </div>

        <!-- 서술형 결과 -->
        <div v-else-if="q.type === 'descriptive'" class="text-answer-result">
          <div class="answer-block">
            <span class="answer-label">내 답안</span>
            <div class="answer-text">{{ quiz.result.answers[idx] || '(미작성)' }}</div>
          </div>
          <div class="answer-block">
            <span class="answer-label">모범 답안</span>
            <div class="answer-text model-answer">{{ q.answer }}</div>
          </div>
        </div>

        <!-- AI 피드백 (서술형/단답형) -->
        <div v-if="(q.type === 'descriptive' || q.type === 'short_answer') && getFeedback(idx)" class="ai-feedback">
          <Sparkles :size="15" color="var(--toss-blue)" />
          <div>
            <strong>AI 채점 피드백</strong>
            <p>{{ getFeedback(idx) }}</p>
          </div>
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
        <div class="question-label-row">
          <p class="question-label">문제 {{ idx + 1 }}</p>
          <span class="question-type-badge" :class="'type-' + (q.type || 'choice')">
            {{ { choice: '객관식', short_answer: '단답형', descriptive: '서술형' }[q.type || 'choice'] }}
          </span>
        </div>

        <!-- 서술형: 복잡도 표시 + 안내 -->
        <div v-if="q.type === 'descriptive'" class="complexity-badge">
          시간복잡도: <strong>{{ q.complexity }}</strong>
          <span class="complexity-hint">— 왜 이 복잡도가 되는지 설명하세요</span>
        </div>

        <!-- 단답형: 안내 -->
        <p v-if="q.type === 'short_answer'" class="short-answer-hint">아래 코드의 시간복잡도를 직접 입력하세요 (예: O(n), O(n²))</p>

        <CodeBlock :code="q.code" />

        <!-- 객관식 -->
        <div v-if="!q.type || q.type === 'choice'" class="options-grid">
          <button
            v-for="(option, optIdx) in q.options"
            :key="optIdx"
            @click="answers[idx] = optIdx"
            class="option-btn"
            :class="{ selected: answers[idx] === optIdx }"
          >{{ option }}</button>
        </div>

        <!-- 단답형 입력 -->
        <div v-else-if="q.type === 'short_answer'" class="text-input-area">
          <input
            type="text"
            v-model="answers[idx]"
            placeholder="예: O(n log n)"
            class="text-answer-input"
          />
        </div>

        <!-- 서술형 입력 -->
        <div v-else-if="q.type === 'descriptive'" class="text-input-area">
          <textarea
            v-model="answers[idx]"
            placeholder="이 코드의 시간복잡도가 왜 이렇게 되는지 설명해주세요..."
            class="text-answer-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="submit-area">
        <button
          @click="submitQuiz"
          class="btn btn-primary submit-quiz-btn"
          :disabled="submitting || !allAnswered"
        >
          <Loader2 v-if="submitting" :size="18" class="spin" />
          {{ submitting ? 'AI 채점 중...' : '제출하기' }}
        </button>
        <p v-if="!allAnswered" class="submit-hint">모든 문제를 풀어주세요</p>
        <p v-if="submitting" class="submit-hint">서술형·단답형은 AI가 채점합니다. 잠시만 기다려주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { ArrowLeft, Lightbulb, Trophy, BarChart3, Loader2, Sparkles } from '@lucide/vue';
import CodeBlock from '../components/CodeBlock.vue';

const route = useRoute();
const quiz = ref(null);
const dashboard = ref(null);
const answers = ref([]);
const submitting = ref(false);

const allAnswered = computed(() => {
  if (!quiz.value) return false;
  return quiz.value.questions.every((q, idx) => {
    const answer = answers.value[idx];
    if (answer === undefined || answer === null) return false;
    // 텍스트 입력은 빈 문자열 체크
    if ((q.type === 'short_answer' || q.type === 'descriptive') && !answer.trim()) return false;
    return true;
  });
});

const choiceCount = computed(() => quiz.value?.questions.filter(q => !q.type || q.type === 'choice').length || 0);
const shortAnswerCount = computed(() => quiz.value?.questions.filter(q => q.type === 'short_answer').length || 0);
const descriptiveCount = computed(() => quiz.value?.questions.filter(q => q.type === 'descriptive').length || 0);

function getResultBadge(q, idx) {
  const type = q.type || 'choice';
  if (type === 'choice') {
    return quiz.value.result.answers[idx] === q.answer ? 'badge-green' : 'badge-red';
  }
  // 서술형/단답형: feedbacks의 score 기반
  const feedbacks = quiz.value.result.feedbacks;
  if (feedbacks && feedbacks[idx] !== undefined) {
    // feedbacks에 score 정보가 없으므로, AI가 정답 판정한 경우를 피드백 내용으로 추론하지 않고
    // 단답형은 문자열 비교, 서술형은 피드백 존재 여부로 표시
    // 실제로는 서버에서 score에 반영되었으므로, 여기서는 피드백 유무만 확인
  }
  return 'badge-blue';
}

function getResultLabel(q, idx) {
  const type = q.type || 'choice';
  if (type === 'choice') {
    return quiz.value.result.answers[idx] === q.answer ? '정답' : '오답';
  }
  return 'AI 채점';
}

function getFeedback(idx) {
  const feedbacks = quiz.value?.result?.feedbacks;
  if (!feedbacks) return null;
  return feedbacks[idx] || feedbacks[String(idx)] || null;
}

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

/* 문제 유형 뱃지 */
.question-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.question-label-row .question-label {
  margin-bottom: 0;
}

.question-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.type-choice {
  background: var(--toss-gray-100);
  color: var(--toss-gray-600);
}

.type-short_answer {
  background: #fef3c7;
  color: #92400e;
}

.type-descriptive {
  background: #ede9fe;
  color: #6d28d9;
}

/* 복잡도 표시 */
.complexity-badge {
  font-size: 14px;
  color: var(--toss-gray-700);
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.complexity-badge strong {
  color: #15803d;
  font-weight: 700;
}

.complexity-hint {
  color: var(--toss-gray-500);
  font-size: 13px;
}

.short-answer-hint {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-bottom: 12px;
}

/* 텍스트 입력 영역 */
.text-input-area {
  margin-top: 14px;
}

.text-answer-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 12px;
  font-size: 15px;
  font-family: 'D2Coding', monospace;
  font-weight: 600;
  color: var(--toss-gray-900);
  background: white;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.text-answer-input:focus {
  outline: none;
  border-color: var(--toss-blue);
}

.text-answer-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--toss-gray-900);
  background: white;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.text-answer-textarea:focus {
  outline: none;
  border-color: var(--toss-blue);
}

/* 결과 - 텍스트 답안 */
.text-answer-result {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--toss-gray-50);
  border-radius: 10px;
}

.answer-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--toss-gray-500);
  min-width: 52px;
}

.answer-value {
  font-size: 15px;
  font-weight: 600;
  font-family: 'D2Coding', monospace;
  color: var(--toss-gray-800);
}

.correct-answer {
  color: #15803d;
}

.answer-block {
  padding: 12px 14px;
  background: var(--toss-gray-50);
  border-radius: 10px;
}

.answer-text {
  font-size: 14px;
  color: var(--toss-gray-800);
  line-height: 1.6;
  margin-top: 6px;
  white-space: pre-wrap;
}

.model-answer {
  color: #15803d;
}

/* AI 피드백 */
.ai-feedback {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  border-radius: 12px;
  border: 1px solid #c7d2fe;
}

.ai-feedback strong {
  font-size: 13px;
  color: var(--toss-blue);
  display: block;
  margin-bottom: 4px;
}

.ai-feedback p {
  font-size: 13px;
  color: var(--toss-gray-700);
  line-height: 1.6;
  margin: 0;
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
