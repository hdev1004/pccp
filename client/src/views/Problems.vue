<template>
  <!-- 스켈레톤 -->
  <div v-if="pageLoading">
    <div class="sk" style="width:100px;height:22px;margin-bottom:20px"></div>
    <div class="sk" style="width:100%;height:44px;border-radius:14px;margin-bottom:24px"></div>
    <div class="sk-card" v-for="i in 4" :key="i">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="sk" style="width:50px;height:14px"></div>
          <div class="sk" style="width:120px;height:15px"></div>
        </div>
        <div class="sk" style="width:40px;height:14px"></div>
      </div>
    </div>
  </div>

  <div v-else class="fade-in">
    <div class="page-header">
      <h1>문제 풀이</h1>
    </div>

    <!-- 하위 탭 -->
    <div class="sub-tabs">
      <button
        class="sub-tab"
        :class="{ active: activeTab === 'curriculum' }"
        @click="activeTab = 'curriculum'"
      >
        <BookOpen :size="16" />
        커리큘럼
      </button>
      <button
        class="sub-tab"
        :class="{ active: activeTab === 'ai' }"
        @click="activeTab = 'ai'"
      >
        <Sparkles :size="16" />
        AI 추천
      </button>
    </div>

    <!-- 커리큘럼 탭 -->
    <div v-if="activeTab === 'curriculum'">
      <div class="curriculum-info card">
        <div class="curriculum-info-inner">
          <GraduationCap :size="20" color="var(--toss-blue)" />
          <div>
            <p class="curriculum-title">PCCP 3급 12주 완성 커리큘럼</p>
            <p class="curriculum-desc">매주 2문제씩, 기초부터 실전까지 단계별로 학습합니다</p>
          </div>
        </div>
      </div>

      <!-- 주차별 아코디언 -->
      <div class="week-list">
        <div v-for="week in weekGroups" :key="week.week" class="card week-card">
          <div class="week-header" @click="toggleWeek(week.week)">
            <div class="week-left">
              <span class="week-num">{{ week.week }}주차</span>
              <span class="week-topic">{{ week.topic }}</span>
            </div>
            <div class="week-right">
              <span class="week-progress">{{ week.submitted }} / {{ week.problems.length }}</span>
              <ChevronDown :size="18" :class="{ rotated: openWeeks.includes(week.week) }" class="chevron" />
            </div>
          </div>
          <div v-if="openWeeks.includes(week.week)" class="week-problems">
            <router-link
              v-for="problem in week.problems"
              :key="problem.id"
              :to="`/problems/${problem.id}`"
              class="problem-row"
            >
              <div class="problem-row-left">
                <div class="problem-status" :class="{ done: problem.submission_count > 0 }">
                  <Check v-if="problem.submission_count > 0" :size="14" />
                </div>
                <span class="problem-title">{{ problem.title }}</span>
              </div>
              <div class="problem-row-right">
                <span class="badge badge-blue">{{ problem.submission_count }}명</span>
                <ChevronRight :size="16" color="var(--toss-gray-400)" />
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 추천 탭 -->
    <div v-if="activeTab === 'ai'">
      <div class="card ai-section">
        <div class="ai-header">
          <div>
            <p class="ai-title">AI 문제 추천</p>
            <p class="ai-desc">주제와 난이도를 선택하면 AI가 프로그래머스 문제를 추천합니다</p>
          </div>
        </div>

        <div class="ai-form">
          <div class="ai-form-row">
            <div class="form-group">
              <label>주제</label>
              <CustomSelect
                v-model="aiTopic"
                :options="topicOptions"
              />
            </div>
            <div class="form-group">
              <label>난이도</label>
              <CustomSelect
                v-model="aiDifficulty"
                :options="difficultyOptions"
              />
            </div>
            <button @click="getAiRecommendations" class="btn btn-primary ai-btn" :disabled="aiLoading">
              <Loader2 v-if="aiLoading" :size="16" class="spin" />
              <Sparkles v-else :size="16" />
              {{ aiLoading ? '추천 중...' : '추천 받기' }}
            </button>
          </div>
        </div>

        <p v-if="aiError" class="ai-error">{{ aiError }}</p>
      </div>

      <!-- AI 추천 결과 -->
      <div v-if="aiResults.length > 0" class="ai-results">
        <div v-for="(rec, idx) in aiResults" :key="idx" class="card ai-result-card">
          <div class="ai-result-top">
            <div>
              <h3 class="ai-result-title">{{ rec.title }}</h3>
              <div class="ai-result-tags">
                <span class="badge badge-blue">{{ rec.topic }}</span>
                <span class="badge badge-green">{{ rec.difficulty }}</span>
              </div>
            </div>
            <a :href="rec.url" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <ExternalLink :size="14" />
              풀러 가기
            </a>
          </div>
          <p class="ai-result-reason">{{ rec.reason }}</p>
          <button @click="addAiProblem(rec)" class="btn btn-secondary btn-sm add-btn" :disabled="rec.added">
            <Plus :size="14" />
            {{ rec.added ? '등록 완료' : '문제 등록' }}
          </button>
        </div>
      </div>

      <!-- 등록된 AI 추천 문제들 -->
      <div v-if="aiProblems.length > 0" class="ai-registered">
        <h3 class="section-title">등록된 AI 추천 문제</h3>
        <div class="problem-list">
          <div v-for="problem in aiProblems" :key="problem.id" class="card problem-item">
            <router-link :to="`/problems/${problem.id}`" class="problem-link">
              <div class="problem-info">
                <div class="problem-title-row">
                  <span class="badge badge-green">AI</span>
                  <h3>{{ problem.title }}</h3>
                </div>
                <p class="problem-meta">{{ problem.topic }} · {{ problem.created_by_nickname || 'AI 추천' }}</p>
              </div>
              <div class="problem-count">
                <p class="count-num">{{ problem.submission_count }}</p>
                <p class="count-label">제출</p>
              </div>
            </router-link>
            <button @click="handleDeleteProblem(problem)" class="delete-btn" title="삭제">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- 삭제 확인 모달 -->
      <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = null">
        <div class="modal-card">
          <h3>문제 삭제</h3>
          <p>"{{ deleteModal.title }}" 문제와 관련 풀이가 모두 삭제됩니다.</p>
          <div class="modal-actions">
            <button @click="deleteModal = null" class="btn btn-secondary">취소</button>
            <button @click="doDeleteProblem" class="btn btn-danger">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const pageLoading = ref(true);
import api from '../api';
import CustomSelect from '../components/Select.vue';
import {
  BookOpen, Sparkles, GraduationCap, ChevronDown, ChevronRight,
  Check, ExternalLink, Plus, Loader2, Trash2,
} from '@lucide/vue';

const activeTab = ref('curriculum');
const problems = ref([]);
const aiProblems = ref([]);
const openWeeks = ref([1]);

// AI 추천
const aiTopic = ref('');
const aiDifficulty = ref('Level 1~2');
const aiResults = ref([]);
const aiLoading = ref(false);
const aiError = ref('');

const topicOptions = [
  { value: '', label: '전체 (PCCP 3급 전반)' },
  { value: '해시', label: '해시' },
  { value: '스택/큐', label: '스택/큐' },
  { value: '정렬', label: '정렬' },
  { value: '완전탐색', label: '완전탐색' },
  { value: 'DFS/BFS', label: 'DFS/BFS' },
  { value: '이분탐색', label: '이분탐색' },
  { value: '탐욕법', label: '탐욕법 (Greedy)' },
  { value: '동적프로그래밍', label: '동적 프로그래밍 (DP)' },
  { value: '그래프', label: '그래프' },
];

const difficultyOptions = [
  { value: 'Level 1', label: 'Level 1 (기초)' },
  { value: 'Level 1~2', label: 'Level 1~2 (입문)' },
  { value: 'Level 2', label: 'Level 2 (중급)' },
  { value: 'Level 2~3', label: 'Level 2~3 (도전)' },
];

const weekGroups = computed(() => {
  const groups = {};
  problems.value
    .filter(p => p.source === 'curriculum')
    .forEach(p => {
      if (!groups[p.week]) {
        groups[p.week] = { week: p.week, topic: p.topic || '', problems: [], submitted: 0 };
      }
      groups[p.week].problems.push(p);
      if (p.submission_count > 0) groups[p.week].submitted++;
    });
  return Object.values(groups).sort((a, b) => a.week - b.week);
});

function toggleWeek(week) {
  const idx = openWeeks.value.indexOf(week);
  if (idx >= 0) openWeeks.value.splice(idx, 1);
  else openWeeks.value.push(week);
}

async function loadProblems() {
  try {
    const [currRes, aiRes] = await Promise.all([
      api.get('/problems', { params: { source: 'curriculum' } }),
      api.get('/problems', { params: { source: 'ai' } }),
    ]);
    problems.value = currRes.data;
    aiProblems.value = aiRes.data;
  } catch (err) {
    console.error('문제 목록 로드 실패:', err);
  } finally {
    pageLoading.value = false;
  }
}

async function getAiRecommendations() {
  aiLoading.value = true;
  aiError.value = '';
  aiResults.value = [];
  try {
    const { data } = await api.post('/problems/ai-recommend', {
      topic: aiTopic.value,
      difficulty: aiDifficulty.value,
    });
    aiResults.value = data.map(r => ({ ...r, added: false }));
  } catch (err) {
    aiError.value = err.response?.data?.message || 'AI 추천에 실패했습니다.';
  } finally {
    aiLoading.value = false;
  }
}

async function addAiProblem(rec) {
  try {
    await api.post('/problems/ai-recommend/add', {
      title: rec.title,
      url: rec.url,
      topic: rec.topic,
    });
    rec.added = true;
    await loadProblems();
  } catch (err) {
    console.error('AI 문제 등록 실패:', err);
  }
}

const deleteModal = ref(null);

function handleDeleteProblem(problem) {
  deleteModal.value = problem;
}

async function doDeleteProblem() {
  if (!deleteModal.value) return;
  try {
    await api.delete(`/problems/${deleteModal.value.id}`);
    deleteModal.value = null;
    await loadProblems();
  } catch (err) {
    console.error('문제 삭제 실패:', err);
  }
}

onMounted(loadProblems);
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

/* 하위 탭 */
.sub-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: var(--toss-gray-100);
  border-radius: 14px;
  padding: 4px;
}

.sub-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--toss-gray-500);
  transition: all 0.2s ease;
}

.sub-tab:hover {
  color: var(--toss-gray-700);
}

.sub-tab.active {
  background: white;
  color: var(--toss-gray-900);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* 커리큘럼 인포 */
.curriculum-info {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
}

.curriculum-info-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.curriculum-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.curriculum-desc {
  font-size: 13px;
  color: var(--toss-gray-600);
  margin-top: 2px;
}

/* 주차 카드 */
.week-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.week-card {
  padding: 0;
  overflow: hidden;
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.week-header:hover {
  background: var(--toss-gray-50);
}

.week-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.week-num {
  font-size: 14px;
  font-weight: 800;
  color: var(--toss-blue);
  min-width: 50px;
}

.week-topic {
  font-size: 15px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.week-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-progress {
  font-size: 13px;
  font-weight: 600;
  color: var(--toss-gray-500);
}

.chevron {
  transition: transform 0.2s ease;
  color: var(--toss-gray-400);
}

.chevron.rotated {
  transform: rotate(180deg);
}

.week-problems {
  border-top: 1px solid var(--toss-gray-100);
  padding: 8px 12px;
}

.problem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  border-radius: 10px;
  transition: background 0.15s;
}

.problem-row:hover {
  background: var(--toss-gray-50);
}

.problem-row-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.problem-status {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--toss-gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.problem-status.done {
  background: var(--toss-green);
  border-color: var(--toss-green);
  color: white;
}

.problem-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--toss-gray-800);
}

.problem-row-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* AI 추천 */
.ai-section {
  margin-bottom: 20px;
}

.ai-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.ai-desc {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-top: 2px;
}

.ai-form {
  margin-top: 20px;
}

.ai-form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.ai-form-row .form-group {
  flex: 1;
}

.ai-form-row .form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--toss-gray-700);
  margin-bottom: 6px;
}

.ai-btn {
  padding: 12px 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ai-error {
  font-size: 13px;
  color: var(--toss-red);
  margin-top: 12px;
}

/* AI 결과 */
.ai-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-result-card {
  padding: 20px;
}

.ai-result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ai-result-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 8px;
}

.ai-result-tags {
  display: flex;
  gap: 6px;
}

.ai-result-reason {
  font-size: 13px;
  color: var(--toss-gray-600);
  margin-top: 12px;
  line-height: 1.5;
  padding: 10px 14px;
  background: var(--toss-gray-50);
  border-radius: 10px;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
  border-radius: 10px;
}

.add-btn {
  margin-top: 12px;
}

/* 등록된 AI 문제 */
.ai-registered {
  margin-top: 28px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 12px;
}

.problem-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.problem-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px !important;
}

.problem-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  cursor: pointer;
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

.problem-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.problem-title-row h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.problem-meta {
  font-size: 13px;
  color: var(--toss-gray-500);
}

.problem-count {
  text-align: right;
  flex-shrink: 0;
}

.count-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--toss-blue);
}

.count-label {
  font-size: 11px;
  color: var(--toss-gray-500);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

@media (max-width: 768px) {
  .ai-form-row {
    flex-direction: column;
  }

  .ai-btn {
    width: 100%;
  }
}
</style>
