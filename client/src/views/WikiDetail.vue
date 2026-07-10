<template>
  <div class="wiki-layout">
    <WikiSidebar :activeId="route.params.id" />

    <main class="wiki-main" v-if="wiki">
    <!-- 상단 헤더 -->
    <div class="wiki-header">
      <router-link to="/wiki" class="back-link">
        <ArrowLeft :size="16" />
        <span>위키 목록</span>
      </router-link>
      <div class="wiki-header-content">
        <div class="wiki-icon-lg" :style="{ background: wiki.color + '15', color: wiki.color }">
          <component :is="getIcon(wiki.icon)" :size="24" />
        </div>
        <div>
          <div class="wiki-meta">
            <span class="badge badge-blue">{{ wiki.category }}</span>
            <span v-if="wiki.week" class="badge badge-green">{{ wiki.week }}주차</span>
          </div>
          <h1>{{ wiki.title }}</h1>
          <p class="wiki-summary">{{ wiki.summary }}</p>
        </div>
      </div>
    </div>

    <!-- 참고 이미지 -->
    <div v-if="wiki.content.references && wiki.content.references.length" class="card section">
      <h2 class="section-title">
        <Image :size="18" color="var(--toss-blue)" />
        참고 자료
      </h2>
      <div class="ref-grid">
        <a
          v-for="(ref, idx) in wiki.content.references"
          :key="idx"
          :href="ref.url"
          target="_blank"
          rel="noopener noreferrer"
          class="ref-card"
        >
          <div class="ref-img-wrap">
            <img :src="ref.imageUrl" :alt="ref.title" class="ref-img" loading="lazy" @error="onImgError" />
          </div>
          <div class="ref-info">
            <p class="ref-title">{{ ref.title }}</p>
            <p class="ref-source">{{ ref.source }}</p>
          </div>
          <ExternalLink :size="14" color="var(--toss-gray-400)" class="ref-ext" />
        </a>
      </div>
    </div>

    <!-- 개념 설명 -->
    <div class="card section">
      <h2 class="section-title">
        <BookOpen :size="18" color="var(--toss-blue)" />
        개념 설명
      </h2>
      <div class="markdown-body" v-html="renderedDescription"></div>
    </div>

    <!-- 시간복잡도 시각화 -->
    <div v-if="wiki.content.complexities" class="card section">
      <h2 class="section-title">
        <Clock :size="18" color="var(--toss-blue)" />
        시간복잡도
      </h2>
      <div class="complexity-bars">
        <div v-for="(c, idx) in wiki.content.complexities" :key="idx" class="complexity-row">
          <div class="complexity-info">
            <span class="complexity-notation">{{ c.notation }}</span>
            <span class="complexity-name">{{ c.name }}</span>
          </div>
          <div class="complexity-bar-wrap">
            <div
              class="complexity-bar"
              :style="{ width: (c.growth / 10) + '%', background: getBarColor(c.growth) }"
            ></div>
          </div>
          <span class="complexity-desc">{{ c.description }}</span>
        </div>
      </div>
    </div>

    <!-- 코드 예시 -->
    <div v-if="wiki.content.codeExamples" class="card section">
      <h2 class="section-title">
        <Code :size="18" color="var(--toss-blue)" />
        코드 예시
      </h2>
      <div v-for="(ex, idx) in wiki.content.codeExamples" :key="idx" class="code-example">
        <h3 class="code-example-title">{{ ex.title }}</h3>
        <CodeBlock :code="ex.code" :language="ex.language" />
      </div>
    </div>

    <!-- AI 질문 -->
    <div class="card section">
      <h2 class="section-title">
        <MessageCircle :size="18" color="var(--toss-blue)" />
        AI에게 질문하기
      </h2>
      <p class="ai-desc">이 개념에 대해 궁금한 점을 질문해보세요</p>
      <div class="ai-input-wrap">
        <input
          v-model="question"
          class="input"
          placeholder="예: 해시 충돌이 발생하면 어떻게 해결하나요?"
          @keyup.enter="askAI"
          :disabled="aiLoading"
        />
        <button @click="askAI" class="btn btn-primary" :disabled="aiLoading || !question.trim()">
          <Loader v-if="aiLoading" :size="16" class="spin" />
          <Send v-else :size="16" />
          <span>질문</span>
        </button>
      </div>

      <!-- AI 대화 기록 -->
      <div v-if="conversations.length" class="ai-conversations">
        <div v-for="(conv, idx) in conversations" :key="idx" class="ai-conversation">
          <div class="ai-question-bubble">
            <User :size="14" />
            <span>{{ conv.question }}</span>
          </div>
          <!-- 로딩 상태 -->
          <div v-if="conv.streaming && !conv.answer" class="ai-answer-bubble ai-loading-bubble">
            <div class="ai-answer-icon">
              <Sparkles :size="14" />
            </div>
            <div class="ai-typing-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="ai-typing-text">답변 생성 중...</span>
            </div>
          </div>
          <!-- 답변 (스트리밍 중이거나 완료) -->
          <div v-else-if="conv.answer" class="ai-answer-bubble">
            <div class="ai-answer-icon">
              <Sparkles :size="14" />
            </div>
            <div class="markdown-body" v-html="renderMarkdown(conv.answer)"></div>
            <div v-if="conv.streaming" class="ai-cursor"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 관련 문제 -->
    <div v-if="wiki.week" class="card section">
      <h2 class="section-title">
        <FileCode :size="18" color="var(--toss-blue)" />
        관련 커리큘럼 문제
      </h2>
      <p class="related-desc">{{ wiki.week }}주차 문제를 풀어보며 개념을 연습하세요</p>
      <router-link to="/problems" class="btn btn-secondary" style="margin-top: 12px;">
        <FileCode :size="16" />
        문제 풀이로 이동
      </router-link>
    </div>
  </main>

  <main class="wiki-main" v-else>
    <!-- 스켈레톤 UI -->
    <div class="skeleton-header">
      <div class="skeleton-back skeleton-pulse"></div>
      <div class="skeleton-header-row">
        <div class="skeleton-icon skeleton-pulse"></div>
        <div class="skeleton-header-text">
          <div class="skeleton-badges">
            <div class="skeleton-badge skeleton-pulse"></div>
            <div class="skeleton-badge skeleton-pulse"></div>
          </div>
          <div class="skeleton-title skeleton-pulse"></div>
          <div class="skeleton-desc skeleton-pulse"></div>
        </div>
      </div>
    </div>
    <div class="card skeleton-section">
      <div class="skeleton-section-title skeleton-pulse"></div>
      <div class="skeleton-line skeleton-pulse"></div>
      <div class="skeleton-line skeleton-pulse" style="width:90%"></div>
      <div class="skeleton-line skeleton-pulse" style="width:75%"></div>
      <div class="skeleton-line skeleton-pulse" style="width:85%"></div>
      <div class="skeleton-line skeleton-pulse" style="width:60%"></div>
    </div>
    <div class="card skeleton-section">
      <div class="skeleton-section-title skeleton-pulse"></div>
      <div class="skeleton-bar-row" v-for="i in 3" :key="i">
        <div class="skeleton-bar-label skeleton-pulse"></div>
        <div class="skeleton-bar skeleton-pulse" :style="{ width: (30 + i * 20) + '%' }"></div>
      </div>
    </div>
    <div class="card skeleton-section">
      <div class="skeleton-section-title skeleton-pulse"></div>
      <div class="skeleton-code skeleton-pulse"></div>
    </div>
  </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import CodeBlock from '../components/CodeBlock.vue';
import WikiSidebar from '../components/WikiSidebar.vue';
import {
  ArrowLeft, BookOpen, Clock, Code, MessageCircle, Send, User,
  Sparkles, FileCode, Loader, ChevronRight, ExternalLink, Image,
  List, Type, Hash, Layers, ArrowUpDown, ScanSearch, Zap, GitBranch,
  Puzzle, Triangle,
} from '@lucide/vue';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);

const route = useRoute();
const wiki = ref(null);
const question = ref('');
const aiLoading = ref(false);
const conversations = ref([]);

const iconMap = {
  clock: Clock, list: List, type: Type, hash: Hash,
  layers: Layers, 'arrow-up-down': ArrowUpDown,
  'scan-search': ScanSearch, zap: Zap, 'git-branch': GitBranch,
  puzzle: Puzzle, triangle: Triangle,
};

function getIcon(name) {
  return iconMap[name] || Clock;
}

function getBarColor(growth) {
  if (growth <= 1) return '#30b06e';
  if (growth <= 50) return '#3182f6';
  if (growth <= 100) return '#6366f1';
  if (growth <= 200) return '#f59e0b';
  if (growth <= 500) return '#f97316';
  return '#f04452';
}

function onImgError(e) {
  e.target.style.display = 'none';
}

// 마크다운 렌더러 — 줄 단위로 파싱하여 누락 없이 처리
function renderMarkdown(text) {
  if (!text) return '';

  // 1) 코드 블록을 플레이스홀더로 보호
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'python';
    let codeHtml;
    try {
      codeHtml = hljs.getLanguage(language)
        ? hljs.highlight(code.trim(), { language }).value
        : hljs.highlightAuto(code.trim()).value;
    } catch {
      codeHtml = code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    // CodeBlock.vue와 동일한 구조로 렌더링
    const rendered = `<div class="cb cb--dark">
      <div class="cb-bar">
        <div class="cb-bar-left">
          <span class="cb-dot" style="background:#ff5f57"></span>
          <span class="cb-dot" style="background:#febc2e"></span>
          <span class="cb-dot" style="background:#28c840"></span>
          <span class="cb-lang">${language}</span>
        </div>
      </div>
      <pre class="cb-pre"><code class="hljs">${codeHtml}</code></pre>
    </div>`;
    codeBlocks.push(rendered);
    return `%%CB${codeBlocks.length - 1}%%`;
  });

  // 2) 테이블을 플레이스홀더로 보호
  const tables = [];
  text = text.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (match, header, body) => {
    const headers = header.split('|').map(h => h.trim()).filter(Boolean);
    const rows = body.trim().split('\n').map(row =>
      row.split('|').map(c => c.trim()).filter(Boolean)
    );
    let t = '<div class="table-wrap"><table><thead><tr>';
    headers.forEach(h => t += `<th>${inline(h)}</th>`);
    t += '</tr></thead><tbody>';
    rows.forEach(row => {
      t += '<tr>';
      row.forEach(cell => t += `<td>${inline(cell)}</td>`);
      t += '</tr>';
    });
    t += '</tbody></table></div>';
    tables.push(t);
    return `%%TB${tables.length - 1}%%`;
  });

  // 3) 줄 단위 파싱
  const lines = text.split('\n');
  const output = [];
  let i = 0;

  function flushParagraph(buf) {
    if (buf.length === 0) return;
    output.push(`<p>${buf.join('<br>')}</p>`);
    buf.length = 0;
  }

  const paraBuf = []; // 일반 텍스트 줄 버퍼

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 빈 줄 → 문단 끊기
    if (trimmed === '') {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    // 코드블록 플레이스홀더
    if (/^%%CB(\d+)%%$/.test(trimmed)) {
      flushParagraph(paraBuf);
      output.push(codeBlocks[parseInt(RegExp.$1)]);
      i++;
      continue;
    }

    // 테이블 플레이스홀더
    if (/^%%TB(\d+)%%$/.test(trimmed)) {
      flushParagraph(paraBuf);
      output.push(tables[parseInt(RegExp.$1)]);
      i++;
      continue;
    }

    // 헤딩 ## / ###
    if (/^## (.+)$/.test(trimmed)) {
      flushParagraph(paraBuf);
      output.push(`<h3>${inline(RegExp.$1)}</h3>`);
      i++;
      continue;
    }
    if (/^### (.+)$/.test(trimmed)) {
      flushParagraph(paraBuf);
      output.push(`<h4>${inline(RegExp.$1)}</h4>`);
      i++;
      continue;
    }

    // 경고 (⚠️)
    if (trimmed.startsWith('⚠️')) {
      flushParagraph(paraBuf);
      output.push(`<div class="warning">${inline(trimmed)}</div>`);
      i++;
      continue;
    }

    // 비순서 리스트 (- 로 시작, 들여쓰기 포함)
    if (/^-\s/.test(trimmed)) {
      flushParagraph(paraBuf);
      const items = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        if (/^-\s/.test(lt)) {
          items.push(lt.slice(2));
          i++;
        } else if (/^\s+-\s/.test(lines[i]) || /^\s+/.test(lines[i]) && items.length > 0 && lt !== '') {
          // 들여쓰기 continuation
          items[items.length - 1] += '<br>' + inline(lt.replace(/^-\s/, ''));
          i++;
        } else {
          break;
        }
      }
      output.push(`<ul>${items.map(it => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // 순서 리스트 (1. 2. 3. 으로 시작)
    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph(paraBuf);
      const items = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        if (/^\d+\.\s/.test(lt)) {
          items.push(lt.replace(/^\d+\.\s/, ''));
          i++;
        } else if (lt !== '' && !/^##/.test(lt) && !/^-\s/.test(lt) && !/^%%/.test(lt)) {
          // continuation line (들여쓰기 등)
          if (items.length > 0) {
            items[items.length - 1] += '<br>' + inline(lt);
          }
          i++;
        } else {
          break;
        }
      }
      output.push(`<ol>${items.map(it => `<li>${inline(it)}</li>`).join('')}</ol>`);
      continue;
    }

    // 일반 텍스트 → 문단 버퍼에 추가
    paraBuf.push(inline(trimmed));
    i++;
  }

  flushParagraph(paraBuf);
  return output.join('');
}

// 인라인 서식 (볼드, 인라인 코드)
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

const renderedDescription = computed(() => {
  return renderMarkdown(wiki.value?.content?.description || '');
});

async function askAI() {
  if (!question.value.trim() || aiLoading.value) return;

  const q = question.value.trim();
  aiLoading.value = true;
  question.value = '';

  // 질문을 먼저 표시 (답변은 아직 비어있고 streaming 상태)
  const conv = reactive({ question: q, answer: '', streaming: true });
  conversations.value.push(conv);

  try {
    const { useAuthStore } = await import('../stores/auth');
    const auth = useAuthStore();

    const response = await fetch(`/api/wiki/${route.params.id}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ question: q }),
    });

    if (!response.ok) {
      try {
        const err = await response.json();
        conv.answer = err.message || '답변을 가져오는 데 실패했습니다.';
      } catch {
        conv.answer = '답변을 가져오는 데 실패했습니다.';
      }
      conv.streaming = false;
      aiLoading.value = false;
      return;
    }

    // SSE가 아닌 일반 JSON 응답이 올 경우 (폴백)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      conv.answer = data.answer || '답변을 가져오는 데 실패했습니다.';
      conv.streaming = false;
      aiLoading.value = false;
      return;
    }

    // SSE 스트리밍 수신
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 마지막 불완전한 줄은 버퍼에 유지

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            conv.answer += parsed.content;
          }
          if (parsed.error) {
            conv.answer += '\n\n오류: ' + parsed.error;
          }
        } catch {}
      }
    }
  } catch (err) {
    if (!conv.answer) {
      conv.answer = '답변을 가져오는 데 실패했습니다. 다시 시도해주세요.';
    }
  } finally {
    conv.streaming = false;
    aiLoading.value = false;
  }
}

async function loadWiki(id) {
  wiki.value = null;
  conversations.value = [];
  question.value = '';
  try {
    const res = await api.get(`/wiki/${id}`);
    wiki.value = res.data;
  } catch (err) {
    console.error('위키 로드 실패:', err);
  }
}

onMounted(() => loadWiki(route.params.id));

watch(() => route.params.id, (newId) => {
  if (newId) loadWiki(newId);
});
</script>

<style scoped>
/* 사이드바 레이아웃 */
.wiki-layout {
  display: flex;
  gap: 24px;
  margin: -32px -24px;
  padding: 32px 24px;
}

.wiki-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .wiki-layout {
    flex-direction: column;
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--toss-gray-500);
  margin-bottom: 16px;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--toss-blue);
}

.wiki-header {
  margin-bottom: 24px;
}

.wiki-header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.wiki-icon-lg {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wiki-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.wiki-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.wiki-summary {
  font-size: 14px;
  color: var(--toss-gray-500);
  margin-top: 4px;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 16px;
}

/* 참고 자료 */
.ref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.ref-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--toss-gray-200);
  transition: all 0.15s ease;
  position: relative;
}

.ref-card:hover {
  border-color: var(--toss-blue);
  background: rgba(49,130,246,0.03);
}

.ref-img-wrap {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--toss-gray-100);
}

.ref-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ref-info {
  flex: 1;
  min-width: 0;
}

.ref-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--toss-gray-900);
  margin-bottom: 2px;
}

.ref-source {
  font-size: 11px;
  color: var(--toss-gray-400);
}

.ref-ext {
  flex-shrink: 0;
}

/* 마크다운 본문 */
.markdown-body {
  font-size: 14px;
  line-height: 1.75;
  color: var(--toss-gray-800);
}

/* 블록 요소 간격 — 일정한 리듬 */
.markdown-body :deep(> h3) {
  font-size: 16px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin: 24px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--toss-gray-100);
}

.markdown-body :deep(> h3:first-child) {
  margin-top: 0;
}

.markdown-body :deep(> h4) {
  font-size: 15px;
  font-weight: 600;
  color: var(--toss-gray-900);
  margin: 20px 0 8px 0;
}

.markdown-body :deep(> p) {
  margin: 10px 0;
}

.markdown-body :deep(> p:first-child) {
  margin-top: 0;
}

.markdown-body :deep(> ul),
.markdown-body :deep(> ol) {
  padding-left: 22px;
  margin: 10px 0;
}

.markdown-body :deep(li) {
  margin: 4px 0;
  line-height: 1.7;
}

.markdown-body :deep(> .table-wrap) {
  margin: 14px 0;
}

.markdown-body :deep(> .cb) {
  margin: 14px 0;
}

.markdown-body :deep(> .warning) {
  margin: 14px 0;
}

.markdown-body :deep(strong) {
  font-weight: 700;
  color: var(--toss-gray-900);
}

.markdown-body :deep(.inline-code) {
  background: rgba(49,130,246,0.08);
  color: var(--toss-blue);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'D2Coding', Consolas, monospace;
}

/* CodeBlock.vue의 글로벌 .cb 스타일이 그대로 적용됨 */

.markdown-body :deep(.table-wrap) {
  overflow-x: auto;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.markdown-body :deep(th) {
  background: var(--toss-gray-50);
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--toss-gray-200);
}

.markdown-body :deep(td) {
  padding: 8px 12px;
  border-bottom: 1px solid var(--toss-gray-100);
}

.markdown-body :deep(.warning) {
  background: rgba(245,158,11,0.08);
  border-left: 3px solid #f59e0b;
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  font-size: 13px;
}

/* 복잡도 바 차트 */
.complexity-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.complexity-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  align-items: center;
}

@media (max-width: 768px) {
  .complexity-row {
    grid-template-columns: 1fr;
  }
}

.complexity-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.complexity-notation {
  font-family: 'D2Coding', Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-gray-900);
  min-width: 80px;
}

.complexity-name {
  font-size: 13px;
  color: var(--toss-gray-600);
}

.complexity-bar-wrap {
  height: 24px;
  background: var(--toss-gray-100);
  border-radius: 6px;
  overflow: hidden;
}

.complexity-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s ease;
  min-width: 4px;
}

.complexity-desc {
  font-size: 12px;
  color: var(--toss-gray-500);
  grid-column: 1 / -1;
  padding-left: 4px;
  margin-top: -6px;
}

/* 코드 예시 */
.code-example {
  margin-bottom: 20px;
}

.code-example:last-child {
  margin-bottom: 0;
}

.code-example-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--toss-gray-800);
  margin-bottom: 8px;
}

/* AI 질문 */
.ai-desc {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-bottom: 12px;
}

.ai-input-wrap {
  display: flex;
  gap: 8px;
}

.ai-input-wrap .input {
  flex: 1;
}

.ai-conversations {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-conversation {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-question-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--toss-gray-100);
  border-radius: 12px 12px 12px 4px;
  font-size: 14px;
  color: var(--toss-gray-800);
  align-self: flex-start;
  max-width: 80%;
}

.ai-answer-bubble {
  display: flex;
  gap: 10px;
  padding: 14px;
  background: rgba(49,130,246,0.04);
  border: 1px solid rgba(49,130,246,0.1);
  border-radius: 4px 12px 12px 12px;
}

.ai-answer-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--toss-blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-answer-bubble .markdown-body {
  flex: 1;
  min-width: 0;
}

/* 타이핑 인디케이터 (답변 대기 중) */
.ai-typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.ai-typing-indicator .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--toss-blue);
  opacity: 0.4;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.ai-typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.ai-typing-text {
  font-size: 13px;
  color: var(--toss-gray-400);
  margin-left: 6px;
}

/* 스트리밍 중 깜빡이는 커서 */
.ai-cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: var(--toss-blue);
  margin-left: 2px;
  animation: cursor-blink 0.8s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 관련 문제 */
.related-desc {
  font-size: 13px;
  color: var(--toss-gray-500);
}

/* 로딩 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 80px 0;
  color: var(--toss-gray-500);
  font-size: 14px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 스켈레톤 UI */
@keyframes skeleton-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton-pulse {
  background: linear-gradient(90deg, var(--toss-gray-100) 25%, var(--toss-gray-50) 50%, var(--toss-gray-100) 75%);
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

.skeleton-header {
  margin-bottom: 24px;
}

.skeleton-back {
  width: 80px;
  height: 14px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.skeleton-header-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.skeleton-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
}

.skeleton-header-text {
  flex: 1;
}

.skeleton-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.skeleton-badge {
  width: 56px;
  height: 18px;
  border-radius: 6px;
}

.skeleton-title {
  width: 220px;
  height: 22px;
  margin-bottom: 8px;
}

.skeleton-desc {
  width: 320px;
  height: 14px;
}

.skeleton-section {
  margin-bottom: 16px;
  padding: 24px;
}

.skeleton-section-title {
  width: 150px;
  height: 18px;
  margin-bottom: 20px;
}

.skeleton-line {
  width: 100%;
  height: 14px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.skeleton-bar-label {
  width: 80px;
  height: 16px;
  flex-shrink: 0;
}

.skeleton-bar {
  height: 22px;
  border-radius: 6px;
}

.skeleton-code {
  width: 100%;
  height: 140px;
  border-radius: 12px;
}
</style>
