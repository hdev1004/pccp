<template>
  <!-- 스켈레톤 -->
  <div v-if="!problem" class="skeleton-wrap">
    <div class="sk" style="width:80px;height:14px;margin-bottom:16px"></div>
    <div class="sk-card">
      <div class="sk" style="width:60px;height:18px;margin-bottom:10px;border-radius:6px"></div>
      <div class="sk" style="width:280px;height:22px;margin-bottom:8px"></div>
      <div class="sk" style="width:120px;height:14px"></div>
    </div>
    <div class="sk-card">
      <div class="sk sk-title"></div>
      <div class="sk sk-block"></div>
      <div class="sk sk-line" style="margin-top:12px;width:90%"></div>
    </div>
    <div class="sk-card">
      <div class="sk sk-title"></div>
      <div class="sk sk-line" style="width:100%"></div>
      <div class="sk sk-line" style="width:85%"></div>
      <div class="sk sk-line" style="width:70%"></div>
    </div>
  </div>

  <div v-else class="fade-in">
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
        <div v-for="sub in problem.submissions" :key="sub.id" class="submission-row" @click="openCodeModal(sub)">
          <div class="submission-left">
            <div class="submission-user">
              <User :size="14" />
              <span class="submission-name">{{ sub.nickname }}</span>
            </div>
            <div class="submission-meta">
              <span class="badge badge-blue">{{ sub.language }}</span>
              <span class="submission-date">{{ formatDate(sub.submitted_at) }}</span>
            </div>
          </div>
          <div class="submission-right">
            <span v-if="sub.memo" class="memo-badge" title="메모 있음">
              <StickyNote :size="12" />
            </span>
            <button class="view-code-btn">
              <Code :size="14" />
              코드 보기
            </button>
            <button
              v-if="sub.user_id === auth.user?.id"
              @click.stop="deleteSubmission"
              class="delete-btn"
              title="삭제"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 코드 모달 (2칸: 코드 | AI 리뷰) -->
    <div v-if="codeModal" class="modal-overlay" @click.self="closeModal">
      <div class="code-modal" :class="{ 'has-review': reviewText || reviewLoading }">
        <div class="code-modal-header">
          <div class="code-modal-user">
            <User :size="16" />
            <span class="code-modal-name">{{ codeModal.nickname }}</span>
            <span class="badge badge-blue">{{ codeModal.language }}</span>
            <span class="code-modal-date">{{ formatDate(codeModal.submitted_at) }}</span>
          </div>
          <div class="code-modal-actions">
            <button
              v-if="!reviewText && !reviewLoading"
              @click="requestReview"
              class="btn btn-primary btn-sm"
            >
              <Sparkles :size="14" />
              AI 코드 리뷰
            </button>
            <button
              v-if="reviewText && !reviewLoading"
              @click="requestReview"
              class="btn btn-secondary btn-sm"
            >
              <Sparkles :size="14" />
              다시 리뷰
            </button>
            <button @click="closeModal" class="modal-close-btn">
              <X :size="18" />
            </button>
          </div>
        </div>
        <div class="code-modal-content">
          <!-- 왼쪽: 코드 + 메모 -->
          <div class="code-modal-left">
            <CodeBlock :code="codeModal.code" :language="codeModal.language" />
            <div v-if="codeModal.memo || codeModal.user_id === auth.user?.id" class="memo-section">
              <div v-if="editingMemo === codeModal.id" class="memo-edit">
                <textarea
                  v-model="editMemoText"
                  class="input memo-textarea"
                  rows="2"
                  placeholder="메모를 입력하세요..."
                ></textarea>
                <div class="memo-edit-actions">
                  <button @click="editingMemo = null" class="btn btn-secondary btn-xs">취소</button>
                  <button @click="saveMemo(codeModal)" class="btn btn-primary btn-xs">저장</button>
                </div>
              </div>
              <div v-else class="memo-display" @click="startEditMemo(codeModal)">
                <StickyNote :size="14" class="memo-icon" />
                <span v-if="codeModal.memo" class="memo-text">{{ codeModal.memo }}</span>
                <span v-else-if="codeModal.user_id === auth.user?.id" class="memo-placeholder">메모 추가...</span>
              </div>
            </div>
          </div>
          <!-- 오른쪽: AI 리뷰 -->
          <div v-if="reviewText || reviewLoading" class="code-modal-right">
            <div class="review-header">
              <Sparkles :size="16" color="var(--toss-blue)" />
              <span>AI 코드 리뷰</span>
            </div>
            <!-- 로딩 -->
            <div v-if="reviewLoading && !reviewText" class="review-loading">
              <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <span class="typing-text">코드를 분석하고 있습니다...</span>
            </div>
            <!-- 리뷰 내용 -->
            <div v-if="reviewText" class="review-body markdown-body" v-html="renderReview(reviewText)"></div>
            <div v-if="reviewLoading && reviewText" class="review-cursor"></div>
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
import { ArrowLeft, ExternalLink, Send, AlertCircle, CheckCircle, User, Trash2, StickyNote, Code, X, Sparkles } from '@lucide/vue';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
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
const codeModal = ref(null);
const reviewText = ref('');
const reviewLoading = ref(false);

function openCodeModal(sub) {
  codeModal.value = sub;
  reviewText.value = sub.review || '';
  reviewLoading.value = false;
}

function closeModal() {
  codeModal.value = null;
  reviewText.value = '';
  reviewLoading.value = false;
}

// 간단한 마크다운→HTML (리뷰용)
// 리뷰용 마크다운 렌더러 — 줄 단위 파싱 (간격 최소화)
function renderReview(text) {
  if (!text) return '';

  // 코드블록 보호
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
    const language = lang || 'python';
    try {
      const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(code.trim(), { language }).value
        : hljs.highlightAuto(code.trim()).value;
      codeBlocks.push(`<div class="cb cb--dark"><div class="cb-bar"><div class="cb-bar-left"><span class="cb-dot" style="background:#ff5f57"></span><span class="cb-dot" style="background:#febc2e"></span><span class="cb-dot" style="background:#28c840"></span><span class="cb-lang">${language}</span></div></div><pre class="cb-pre"><code class="hljs">${highlighted}</code></pre></div>`);
    } catch {
      codeBlocks.push(`<pre class="review-code"><code>${code.trim()}</code></pre>`);
    }
    return `%%RCB${codeBlocks.length - 1}%%`;
  });

  const ril = (t) => t
    .replace(/`([^`]+)`/g, '<code class="review-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const lines = text.split('\n');
  const out = [];
  let i = 0;
  const paraBuf = [];

  function flushPara() {
    if (paraBuf.length === 0) return;
    out.push(`<p>${paraBuf.join(' ')}</p>`);
    paraBuf.length = 0;
  }

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === '') { flushPara(); i++; continue; }

    if (/^%%RCB(\d+)%%$/.test(trimmed)) {
      flushPara();
      out.push(codeBlocks[parseInt(RegExp.$1)]);
      i++; continue;
    }

    if (/^###? (.+)$/.test(trimmed)) {
      flushPara();
      const tag = trimmed.startsWith('### ') ? 'h4' : 'h3';
      const content = trimmed.replace(/^###? /, '');
      out.push(`<${tag} class="review-h">${ril(content)}</${tag}>`);
      i++; continue;
    }

    if (/^[-*] /.test(trimmed)) {
      flushPara();
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(`<li>${ril(lines[i].trim().slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      flushPara();
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(`<li>${ril(lines[i].trim().replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    paraBuf.push(ril(trimmed));
    i++;
  }
  flushPara();
  return out.join('');
}

async function requestReview() {
  if (!codeModal.value || reviewLoading.value) return;
  reviewLoading.value = true;
  reviewText.value = '';

  try {
    const auth = useAuthStore();
    const response = await fetch(`/api/problems/${route.params.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        code: codeModal.value.code,
        language: codeModal.value.language,
      }),
    });

    if (!response.ok) {
      try {
        const err = await response.json();
        reviewText.value = '리뷰 생성에 실패했습니다: ' + (err.message || '');
      } catch {
        reviewText.value = '리뷰 생성에 실패했습니다.';
      }
      reviewLoading.value = false;
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      reviewText.value = data.answer || '리뷰를 가져오지 못했습니다.';
      reviewLoading.value = false;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) reviewText.value += parsed.content;
          if (parsed.error) reviewText.value += '\n\n오류: ' + parsed.error;
        } catch {}
      }
    }
  } catch {
    if (!reviewText.value) reviewText.value = '리뷰 생성에 실패했습니다. 다시 시도해주세요.';
  } finally {
    reviewLoading.value = false;
    // 모달 데이터에도 반영 (다시 열었을 때 유지)
    if (codeModal.value && reviewText.value) {
      codeModal.value.review = reviewText.value;
    }
  }
}

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
  gap: 4px;
}

.submission-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.submission-row:hover {
  background: var(--toss-gray-50);
}

.submission-left {
  display: flex;
  align-items: center;
  gap: 14px;
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

.submission-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.submission-date {
  font-size: 12px;
  color: var(--toss-gray-500);
}

.submission-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.memo-badge {
  display: flex;
  align-items: center;
  color: var(--toss-yellow);
}

.view-code-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(49,130,246,0.08);
  color: var(--toss-blue);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-code-btn:hover {
  background: rgba(49,130,246,0.15);
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

/* 코드 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.code-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  animation: modal-in 0.2s ease;
  transition: max-width 0.3s ease;
  overflow: hidden;
}

.code-modal.has-review {
  max-width: 1200px;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.code-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--toss-gray-100);
  flex-shrink: 0;
}

.code-modal-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-modal-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.code-modal-date {
  font-size: 12px;
  color: var(--toss-gray-500);
}

.code-modal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
  border-radius: 10px;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: var(--toss-gray-100);
  color: var(--toss-gray-600);
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: var(--toss-gray-200);
  color: var(--toss-gray-900);
}

/* 2칸 레이아웃 */
.code-modal-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.code-modal-left {
  flex: 1;
  min-width: 0;
  padding: 20px;
  overflow-y: auto;
}

.code-modal-right {
  width: 420px;
  flex-shrink: 0;
  border-left: 1px solid var(--toss-gray-100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slide-in-right 0.3s ease;
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.review-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-gray-900);
  border-bottom: 1px solid var(--toss-gray-100);
  flex-shrink: 0;
}

.review-body {
  flex: 1;
  padding: 14px 18px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: var(--toss-gray-800);
}

.review-body :deep(p) {
  margin: 4px 0;
}

.review-body :deep(p:first-child) {
  margin-top: 0;
}

.review-body :deep(h3.review-h),
.review-body :deep(h4.review-h) {
  font-size: 13px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin: 12px 0 4px 0;
}

.review-body :deep(h3.review-h:first-child),
.review-body :deep(h4.review-h:first-child) {
  margin-top: 0;
}

.review-body :deep(strong) {
  font-weight: 700;
  color: var(--toss-gray-900);
}

.review-body :deep(ul),
.review-body :deep(ol) {
  padding-left: 18px;
  margin: 2px 0;
}

.review-body :deep(li) {
  margin: 1px 0;
  line-height: 1.5;
}

.review-body :deep(.cb) {
  margin: 8px 0;
}

.review-body :deep(.review-inline-code) {
  background: rgba(49,130,246,0.08);
  color: var(--toss-blue);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'D2Coding', monospace;
}

/* 리뷰 로딩 */
.review-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 18px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--toss-blue);
  opacity: 0.4;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.typing-text {
  font-size: 13px;
  color: var(--toss-gray-400);
}

.review-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: var(--toss-blue);
  margin: 0 18px 16px;
  animation: cursor-blink 0.8s step-end infinite;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 900px) {
  .code-modal.has-review {
    max-width: 100%;
  }
  .code-modal-content {
    flex-direction: column;
  }
  .code-modal-right {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--toss-gray-100);
    max-height: 50vh;
  }
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
