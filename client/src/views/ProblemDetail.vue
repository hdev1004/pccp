<template>
  <div v-if="problem">
    <router-link to="/problems" class="back-link">
      <ArrowLeft :size="16" />
      <span>문제 목록</span>
    </router-link>

    <div class="card problem-header">
      <div class="problem-info">
        <span class="badge badge-blue">{{ problem.week }}주차</span>
        <h1>{{ problem.title }}</h1>
        <p class="problem-author">등록: {{ problem.created_by_nickname }}</p>
      </div>
      <a :href="problem.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        프로그래머스에서 풀기
        <ExternalLink :size="15" />
      </a>
    </div>

    <!-- 풀이 제출 -->
    <div class="card">
      <h2 class="section-title">풀이 제출</h2>
      <form @submit.prevent="submitCode">
        <div class="form-group lang-group">
          <CustomSelect
            v-model="language"
            :options="langOptions"
          />
        </div>
        <textarea
          v-model="code"
          class="input code-textarea"
          rows="12"
          placeholder="풀이 코드를 붙여넣으세요..."
        ></textarea>
        <textarea
          v-model="memo"
          class="input memo-textarea"
          rows="3"
          placeholder="메모 (풀이 접근법, 시간복잡도, 배운 점 등)"
        ></textarea>
        <p v-if="submitError" class="msg-error">
          <AlertCircle :size="14" />
          {{ submitError }}
        </p>
        <p v-if="submitSuccess" class="msg-success">
          <CheckCircle :size="14" />
          제출 완료!
        </p>
        <button type="submit" class="btn btn-primary submit-btn">
          <Send :size="15" />
          제출하기
        </button>
      </form>
    </div>

    <!-- 제출 현황 -->
    <div class="card">
      <h2 class="section-title">
        제출 현황
        <span class="title-count">({{ problem.submissions?.length || 0 }}명)</span>
      </h2>
      <div v-if="!problem.submissions?.length" class="empty">아직 제출한 사람이 없습니다</div>
      <div v-else class="submissions">
        <div v-for="sub in problem.submissions" :key="sub.id" class="submission">
          <div class="submission-header">
            <div class="submission-user">
              <User :size="14" />
              <span class="submission-name">{{ sub.nickname }}</span>
              <span class="badge badge-blue">{{ sub.language }}</span>
            </div>
            <div class="submission-actions">
              <span class="submission-date">{{ formatDate(sub.submitted_at) }}</span>
              <button
                v-if="sub.user_id === auth.user?.id"
                @click="deleteSubmission"
                class="delete-btn"
                title="삭제"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <CodeBlock :code="sub.code" :language="sub.language === 'python' ? 'python' : sub.language" />
          <!-- 메모 표시 -->
          <div v-if="sub.memo || sub.user_id === auth.user?.id" class="memo-section">
            <div v-if="editingMemo === sub.id" class="memo-edit">
              <textarea
                v-model="editMemoText"
                class="input memo-textarea"
                rows="2"
                placeholder="메모를 입력하세요..."
              ></textarea>
              <div class="memo-edit-actions">
                <button @click="editingMemo = null" class="btn btn-secondary btn-xs">취소</button>
                <button @click="saveMemo(sub)" class="btn btn-primary btn-xs">저장</button>
              </div>
            </div>
            <div v-else class="memo-display" @click="startEditMemo(sub)">
              <StickyNote :size="14" class="memo-icon" />
              <span v-if="sub.memo" class="memo-text">{{ sub.memo }}</span>
              <span v-else-if="sub.user_id === auth.user?.id" class="memo-placeholder">메모 추가...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { ArrowLeft, ExternalLink, Send, AlertCircle, CheckCircle, User, Trash2, StickyNote } from '@lucide/vue';
import CodeBlock from '../components/CodeBlock.vue';
import { useAuthStore } from '../stores/auth';
import CustomSelect from '../components/Select.vue';

const auth = useAuthStore();

const langOptions = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const route = useRoute();
const problem = ref(null);
const code = ref('');
const memo = ref('');
const language = ref('python');
const submitError = ref('');
const submitSuccess = ref(false);
const editingMemo = ref(null);
const editMemoText = ref('');

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadProblem() {
  try {
    const { data } = await api.get(`/problems/${route.params.id}`);
    problem.value = data;
  } catch (err) {
    console.error('문제 로드 실패:', err);
  }
}

async function submitCode() {
  submitError.value = '';
  submitSuccess.value = false;
  if (!code.value.trim()) {
    submitError.value = '코드를 입력해주세요.';
    return;
  }
  try {
    await api.post(`/problems/${route.params.id}/submit`, { code: code.value, language: language.value, memo: memo.value });
    submitSuccess.value = true;
    code.value = '';
    memo.value = '';
    await loadProblem();
  } catch (err) {
    submitError.value = err.response?.data?.message || '제출에 실패했습니다.';
  }
}

function startEditMemo(sub) {
  if (sub.user_id !== auth.user?.id) return;
  editingMemo.value = sub.id;
  editMemoText.value = sub.memo || '';
}

async function saveMemo(sub) {
  try {
    await api.patch(`/problems/${route.params.id}/memo`, { memo: editMemoText.value });
    editingMemo.value = null;
    await loadProblem();
  } catch (err) {
    console.error('메모 저장 실패:', err);
  }
}

async function deleteSubmission() {
  if (!confirm('풀이를 삭제하시겠습니까?')) return;
  try {
    await api.delete(`/problems/${route.params.id}/submit`);
    await loadProblem();
  } catch (err) {
    console.error('풀이 삭제 실패:', err);
  }
}

onMounted(loadProblem);
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

.problem-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.problem-info h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-top: 8px;
}

.problem-author {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-top: 4px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 16px;
}

.title-count {
  font-weight: 400;
  font-size: 14px;
  color: var(--toss-gray-400);
}

.form-group {
  margin-bottom: 12px;
}

.lang-group {
  max-width: 180px;
}

.code-textarea {
  font-family: 'D2Coding', 'D2 Coding', Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}

.msg-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--toss-red);
  margin-top: 10px;
}

.msg-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--toss-green);
  margin-top: 10px;
}

.submit-btn {
  margin-top: 12px;
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--toss-gray-400);
  font-size: 14px;
}

.submissions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission {
  padding: 16px;
  background: var(--toss-gray-50);
  border-radius: 14px;
}

.submission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.submission-user {
  display: flex;
  align-items: center;
  gap: 6px;
}

.submission-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--toss-gray-900);
}

.submission-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.submission-date {
  font-size: 12px;
  color: var(--toss-gray-500);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--toss-gray-400);
  cursor: pointer;
  transition: all 0.15s ease;
}

.delete-btn:hover {
  background: rgba(240, 68, 82, 0.08);
  color: var(--toss-red);
}

.memo-textarea {
  font-size: 13px;
  margin-top: 10px;
  resize: vertical;
}

.memo-section {
  margin-top: 12px;
}

.memo-display {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: #fffbeb;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.memo-display:hover {
  background: #fef3c7;
}

.memo-icon {
  color: var(--toss-yellow);
  flex-shrink: 0;
  margin-top: 1px;
}

.memo-text {
  font-size: 13px;
  color: var(--toss-gray-700);
  line-height: 1.5;
  white-space: pre-wrap;
}

.memo-placeholder {
  font-size: 13px;
  color: var(--toss-gray-400);
}

.memo-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.memo-edit-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-xs {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
}
</style>
