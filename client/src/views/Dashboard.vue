<template>
  <!-- 스켈레톤 -->
  <div v-if="loading">
    <div style="margin-bottom:28px">
      <div class="sk" style="width:220px;height:22px;margin-bottom:8px"></div>
      <div class="sk" style="width:180px;height:14px"></div>
    </div>
    <div class="stat-grid">
      <div class="sk-card" v-for="i in 3" :key="i" style="margin-top:0!important">
        <div class="sk" style="width:100px;height:13px;margin-bottom:14px"></div>
        <div class="sk" style="width:50px;height:24px"></div>
      </div>
    </div>
    <div class="sk-card">
      <div class="sk sk-title" style="width:120px"></div>
      <div class="sk sk-line" style="width:100%" v-for="i in 3" :key="'p'+i"></div>
    </div>
    <div class="sk-card">
      <div class="sk sk-title" style="width:140px"></div>
      <div class="sk sk-line" style="width:100%" v-for="i in 2" :key="'q'+i"></div>
    </div>
  </div>

  <div v-else class="fade-in">
    <div class="greeting">
      <div class="greeting-title">
        <h1>안녕하세요, {{ auth.user?.nickname }}님</h1>
        <Hand :size="24" color="var(--toss-gray-400)" />
      </div>
      <p>이번 주 스터디 현황을 확인하세요</p>
    </div>

    <!-- 요약 카드 -->
    <div class="stat-grid">
      <div class="card stat-card">
        <div class="stat-label">
          <FileText :size="16" color="var(--toss-gray-400)" />
          <span>이번 주 문제</span>
        </div>
        <p class="stat-value">{{ stats.problemCount }}</p>
      </div>
      <div class="card stat-card">
        <div class="stat-label">
          <Send :size="16" color="var(--toss-gray-400)" />
          <span>내 풀이 제출</span>
        </div>
        <p class="stat-value blue">{{ stats.mySubmissions }}</p>
      </div>
      <div class="card stat-card">
        <div class="stat-label">
          <Brain :size="16" color="var(--toss-gray-400)" />
          <span>이번 주 퀴즈</span>
        </div>
        <p class="stat-value" :class="stats.quizCompleted ? 'green' : 'red'">
          {{ stats.quizCompleted ? '완료' : '미완료' }}
        </p>
      </div>
    </div>

    <!-- 최근 문제 -->
    <div class="card section">
      <div class="section-header">
        <h2>최근 문제</h2>
        <router-link to="/problems" class="see-all">
          전체보기 <ChevronRight :size="16" />
        </router-link>
      </div>
      <div v-if="recentProblems.length === 0" class="empty">등록된 문제가 없습니다</div>
      <div v-else class="list">
        <router-link
          v-for="problem in recentProblems"
          :key="problem.id"
          :to="`/problems/${problem.id}`"
          class="list-item"
        >
          <div>
            <p class="list-title">{{ problem.title }}</p>
            <p class="list-sub">{{ problem.source === 'ai' ? 'AI 추천' : problem.week + '주차' }} · {{ problem.created_by_nickname || '' }}</p>
          </div>
          <span class="badge badge-blue">{{ problem.submission_count }}명 제출</span>
        </router-link>
      </div>
    </div>

    <!-- 최근 퀴즈 -->
    <div class="card section">
      <div class="section-header">
        <h2>시간복잡도 퀴즈</h2>
        <router-link to="/quiz" class="see-all">
          전체보기 <ChevronRight :size="16" />
        </router-link>
      </div>
      <div v-if="recentQuizzes.length === 0" class="empty">생성된 퀴즈가 없습니다</div>
      <div v-else class="list">
        <router-link
          v-for="quiz in recentQuizzes"
          :key="quiz.id"
          :to="`/quiz/${quiz.id}`"
          class="list-item"
        >
          <div>
            <p class="list-title">{{ quiz.week }}주차 퀴즈</p>
            <p class="list-sub">{{ quiz.participant_count }}명 참여</p>
          </div>
          <span class="badge" :class="quiz.completed ? 'badge-green' : 'badge-red'">
            {{ quiz.completed ? '완료' : '미완료' }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';
import { Hand, FileText, Send, Brain, ChevronRight } from '@lucide/vue';

const loading = ref(true);

const auth = useAuthStore();
const stats = ref({ problemCount: 0, mySubmissions: 0, quizCompleted: false });
const recentProblems = ref([]);
const recentQuizzes = ref([]);

onMounted(async () => {
  try {
    const [problemsRes, quizzesRes] = await Promise.all([
      api.get('/problems'),
      api.get('/quiz'),
    ]);
    recentProblems.value = problemsRes.data.slice(0, 5);
    recentQuizzes.value = quizzesRes.data.slice(0, 3);

    // 가장 최근 주차의 퀴즈/문제 기준으로 표시
    const latestQuizWeek = quizzesRes.data.length > 0
      ? Math.max(...quizzesRes.data.map(q => q.week))
      : null;
    const latestProblemWeek = problemsRes.data.length > 0
      ? Math.max(...problemsRes.data.map(p => p.week))
      : 1;

    const thisWeekProblems = problemsRes.data.filter(p => p.week === latestProblemWeek);
    stats.value.problemCount = thisWeekProblems.length;
    stats.value.mySubmissions = thisWeekProblems.filter(p => p.submission_count > 0).length;

    const latestQuiz = latestQuizWeek !== null
      ? quizzesRes.data.find(q => q.week === latestQuizWeek)
      : null;
    stats.value.quizCompleted = latestQuiz?.completed || false;
  } catch (err) {
    console.error('대시보드 데이터 로드 실패:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.greeting {
  margin-bottom: 28px;
}

.greeting-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.greeting h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.greeting p {
  color: var(--toss-gray-500);
  font-size: 14px;
  margin-top: 4px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stat-grid { grid-template-columns: 1fr; }
}

.stat-card {
  padding: 20px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  margin-top: 0 !important;
  justify-content: space-between;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--toss-gray-900);
}

.stat-value.blue { color: var(--toss-blue); }
.stat-value.green { color: var(--toss-green); }
.stat-value.red { color: var(--toss-red); }

.section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.see-all {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--toss-blue);
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--toss-gray-400);
  font-size: 14px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  transition: background 0.15s ease;
}

.list-item:hover {
  background: var(--toss-gray-50);
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.list-sub {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-top: 2px;
}
</style>
