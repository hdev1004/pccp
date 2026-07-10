<template>
  <div class="wiki-layout">
    <WikiSidebar />

    <!-- 메인 콘텐츠 -->
    <main class="wiki-main">
      <div class="page-header">
        <h1>알고리즘 위키</h1>
        <p class="page-desc">PCCP 3급에 필요한 알고리즘과 자료구조 개념을 정리했습니다</p>
      </div>

      <!-- 복잡도 비교 그래프 — bigocheatsheet.com 스타일 -->
      <div class="card complexity-chart-card">
        <h2 class="section-title">
          <TrendingUp :size="18" color="var(--toss-blue)" />
          Big-O Complexity Chart
        </h2>
        <p class="chart-desc">입력 크기(n)가 커질수록 알고리즘마다 연산 횟수가 얼마나 달라지는지 보여줍니다</p>

        <div class="chart-container">
          <svg viewBox="0 0 700 420" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fce4ec" />
                <stop offset="35%" stop-color="#fff8e1" />
                <stop offset="65%" stop-color="#e8f5e9" />
                <stop offset="100%" stop-color="#e8f5e9" />
              </linearGradient>
            </defs>

            <!-- 배경 그라디언트 -->
            <rect x="65" y="20" width="540" height="320" fill="url(#bg-grad)" rx="8" />

            <!-- 영역 라벨 (왼쪽 세로) -->
            <text x="72" y="42"  fill="#d32f2f" font-size="9" font-weight="700" opacity="0.5">Horrible</text>
            <text x="72" y="108" fill="#e65100" font-size="9" font-weight="700" opacity="0.5">Bad</text>
            <text x="72" y="188" fill="#f9a825" font-size="9" font-weight="700" opacity="0.45">Fair</text>
            <text x="72" y="275" fill="#2e7d32" font-size="9" font-weight="700" opacity="0.45">Good</text>
            <text x="72" y="330" fill="#1b5e20" font-size="9" font-weight="700" opacity="0.45">Excellent</text>

            <!-- 가로 구분선 (은은하게) -->
            <line x1="65" y1="85"  x2="605" y2="85"  stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="4,4" />
            <line x1="65" y1="150" x2="605" y2="150" stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="4,4" />
            <line x1="65" y1="215" x2="605" y2="215" stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="4,4" />
            <line x1="65" y1="280" x2="605" y2="280" stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="4,4" />

            <!-- 축 -->
            <line x1="65" y1="20" x2="65" y2="340" stroke="#bbb" stroke-width="1" />
            <line x1="65" y1="340" x2="605" y2="340" stroke="#bbb" stroke-width="1" />

            <!-- 축 라벨 -->
            <text x="38" y="180" fill="#999" font-size="12" font-weight="600" text-anchor="middle" transform="rotate(-90,38,180)">연산 횟수</text>
            <text x="335" y="375" fill="#999" font-size="12" font-weight="600" text-anchor="middle">입력 크기 (n)</text>

            <!-- ═══ 곡선 (아래부터 위로, 느린 순서대로) ═══ -->

            <!-- O(1) — 초록 실선, 수평 -->
            <line x1="65" y1="328" x2="595" y2="328" stroke="#2e7d32" stroke-width="3" stroke-linecap="round" />

            <!-- O(log n) — 초록 실선, 느리게 올라감 -->
            <path d="M 65,328 C 140,295 240,278 340,268 C 440,261 520,257 595,255"
              fill="none" stroke="#43a047" stroke-width="3" stroke-linecap="round" />

            <!-- O(n) — 연두 실선, 직선 -->
            <line x1="65" y1="328" x2="595" y2="195" stroke="#7cb342" stroke-width="3" stroke-linecap="round" />

            <!-- O(n log n) — 노랑 파선 -->
            <path d="M 65,328 C 180,305 300,265 400,215 C 480,178 540,145 595,115"
              fill="none" stroke="#f9a825" stroke-width="3" stroke-linecap="round" stroke-dasharray="8,4" />

            <!-- O(n²) — 주황 실선, 포물선 -->
            <path d="M 65,328 C 160,322 260,300 340,265 C 420,225 480,165 530,95 C 560,55 580,30 595,22"
              fill="none" stroke="#ef6c00" stroke-width="3" stroke-linecap="round" />

            <!-- O(2^n) — 빨강 파선, 급격 -->
            <path d="M 65,328 C 120,325 180,320 230,310 C 280,295 320,268 355,225 C 385,185 410,130 430,65 C 442,30 448,22 450,22"
              fill="none" stroke="#e53935" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,3" />

            <!-- O(n!) — 진빨강 점선, 거의 수직 -->
            <path d="M 65,328 C 80,325 100,318 115,305 C 135,282 150,245 162,195 C 175,140 183,80 188,22"
              fill="none" stroke="#b71c1c" stroke-width="3" stroke-linecap="round" stroke-dasharray="3,4" />

            <!-- ═══ 라벨 (배경 있는 태그) ═══ -->

            <!-- O(1) 라벨 -->
            <rect x="610" y="320" width="52" height="20" rx="5" fill="#2e7d32" />
            <text x="636" y="334" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(1)</text>

            <!-- O(log n) 라벨 -->
            <rect x="610" y="246" width="72" height="20" rx="5" fill="#43a047" />
            <text x="646" y="260" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(log n)</text>

            <!-- O(n) 라벨 -->
            <rect x="610" y="186" width="52" height="20" rx="5" fill="#7cb342" />
            <text x="636" y="200" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(n)</text>

            <!-- O(n log n) 라벨 -->
            <rect x="610" y="106" width="82" height="20" rx="5" fill="#f9a825" />
            <text x="651" y="120" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(n log n)</text>

            <!-- O(n²) 라벨 -->
            <rect x="610" y="13" width="52" height="20" rx="5" fill="#ef6c00" />
            <text x="636" y="27" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(n²)</text>

            <!-- O(2^n) 라벨 -->
            <rect x="456" y="13" width="52" height="20" rx="5" fill="#e53935" />
            <text x="482" y="27" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(2ⁿ)</text>

            <!-- O(n!) 라벨 -->
            <rect x="194" y="13" width="48" height="20" rx="5" fill="#b71c1c" />
            <text x="218" y="27" fill="white" font-size="11" font-weight="700" text-anchor="middle" font-family="'D2Coding',monospace">O(n!)</text>

            <!-- 끝점 마커 (흰 테두리 점) -->
            <circle cx="595" cy="328" r="4.5" fill="#2e7d32" stroke="white" stroke-width="2" />
            <circle cx="595" cy="255" r="4.5" fill="#43a047" stroke="white" stroke-width="2" />
            <circle cx="595" cy="195" r="4.5" fill="#7cb342" stroke="white" stroke-width="2" />
            <circle cx="595" cy="115" r="4.5" fill="#f9a825" stroke="white" stroke-width="2" />
            <circle cx="595" cy="22"  r="4.5" fill="#ef6c00" stroke="white" stroke-width="2" />
            <circle cx="450" cy="22"  r="4.5" fill="#e53935" stroke="white" stroke-width="2" />
            <circle cx="188" cy="22"  r="4.5" fill="#b71c1c" stroke="white" stroke-width="2" />
          </svg>
        </div>

        <!-- 범례 -->
        <div class="legend">
          <div v-for="c in legendItems" :key="c.label" class="legend-item">
            <span class="legend-line" :style="{ background: c.color }"></span>
            <span class="legend-label">{{ c.label }}</span>
            <span class="legend-grade" :class="'grade-' + c.grade">{{ c.gradeName }}</span>
          </div>
        </div>

        <!-- 하단 설명 카드 -->
        <div class="complexity-summary">
          <div v-for="c in legendItems" :key="'sum-'+c.label" class="complexity-summary-item">
            <div class="summary-dot" :style="{ background: c.color }"></div>
            <div>
              <span class="summary-notation">{{ c.label }}</span>
              <span class="summary-example">{{ c.example }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 카테고리별 위키 목록 -->
      <div v-for="cat in categories" :key="cat" class="category-section">
        <h2 class="category-title">{{ cat }}</h2>
        <div class="wiki-grid">
          <router-link
            v-for="item in getByCategory(cat)"
            :key="item.id"
            :to="`/wiki/${item.id}`"
            class="wiki-card card"
          >
            <div class="wiki-card-header">
              <div class="wiki-icon" :style="{ background: item.color + '15', color: item.color }">
                <component :is="getIcon(item.icon)" :size="20" />
              </div>
              <span v-if="item.week" class="badge badge-blue">{{ item.week }}주차</span>
            </div>
            <h3 class="wiki-title">{{ item.title }}</h3>
            <p class="wiki-summary">{{ item.summary }}</p>
            <div class="wiki-arrow">
              <ChevronRight :size="16" color="var(--toss-gray-400)" />
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import {
  TrendingUp, ChevronRight, Clock, List, Type, Hash,
  Layers, ArrowUpDown, ScanSearch, Zap, GitBranch, Puzzle, Triangle
} from '@lucide/vue';
import WikiSidebar from '../components/WikiSidebar.vue';

const items = ref([]);

const legendItems = [
  { label: 'O(1)',       color: '#1b5e20', grade: 'excellent', gradeName: '최고',  example: '해시 조회, 배열 인덱스' },
  { label: 'O(log n)',   color: '#2e7d32', grade: 'excellent', gradeName: '매우 좋음', example: '이진 탐색' },
  { label: 'O(n)',       color: '#558b2f', grade: 'good',      gradeName: '좋음',  example: '배열 순회, 선형 탐색' },
  { label: 'O(n log n)', color: '#f9a825', grade: 'fair',      gradeName: '보통',  example: '병합 정렬, 퀵 정렬' },
  { label: 'O(n²)',      color: '#e65100', grade: 'bad',       gradeName: '나쁨',  example: '버블 정렬, 이중 반복문' },
  { label: 'O(2ⁿ)',      color: '#d32f2f', grade: 'horrible',  gradeName: '끔찍',  example: '부분집합, 피보나치(재귀)' },
  { label: 'O(n!)',      color: '#c62828', grade: 'horrible',  gradeName: '최악',  example: '순열 전부 생성' },
];

const iconMap = {
  clock: Clock, list: List, type: Type, hash: Hash,
  layers: Layers, 'arrow-up-down': ArrowUpDown,
  'scan-search': ScanSearch, zap: Zap, 'git-branch': GitBranch,
  puzzle: Puzzle, triangle: Triangle,
};

function getIcon(name) {
  return iconMap[name] || Clock;
}

const categories = computed(() => {
  const cats = [...new Set(items.value.map(i => i.category))];
  return cats.sort((a, b) => {
    if (a === '기초 개념') return -1;
    if (b === '기초 개념') return 1;
    if (a === '자료구조') return -1;
    if (b === '자료구조') return 1;
    return 0;
  });
});

function getByCategory(cat) {
  return items.value.filter(i => i.category === cat);
}

onMounted(async () => {
  try {
    const res = await api.get('/wiki');
    items.value = res.data;
  } catch (err) {
    console.error('위키 목록 로드 실패:', err);
  }
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

/* 페이지 헤더 */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--toss-gray-900);
}

.page-desc {
  color: var(--toss-gray-500);
  font-size: 14px;
  margin-top: 4px;
}

/* 복잡도 그래프 */
.complexity-chart-card {
  margin-top: 8px;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 8px;
}

.chart-desc {
  font-size: 13px;
  color: var(--toss-gray-500);
  margin-bottom: 16px;
}

.chart-container {
  background: white;
  border: 1px solid var(--toss-gray-200);
  border-radius: 14px;
  padding: 8px;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* 범례 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-line {
  width: 14px;
  height: 3px;
  border-radius: 2px;
}

.legend-label {
  font-size: 11px;
  font-weight: 600;
  font-family: 'D2Coding', monospace;
  color: var(--toss-gray-700);
}

.legend-grade {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
}

.grade-excellent { background: rgba(27,94,32,0.1); color: #1b5e20; }
.grade-good { background: rgba(46,125,50,0.1); color: #2e7d32; }
.grade-fair { background: rgba(249,168,37,0.15); color: #f57f17; }
.grade-bad { background: rgba(230,81,0,0.1); color: #e65100; }
.grade-horrible { background: rgba(198,40,40,0.1); color: #c62828; }

/* 하단 요약 */
.complexity-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.complexity-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--toss-gray-50);
  border-radius: 8px;
}

.summary-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.summary-notation {
  font-size: 11px;
  font-weight: 700;
  font-family: 'D2Coding', monospace;
  color: var(--toss-gray-800);
  display: block;
}

.summary-example {
  font-size: 11px;
  color: var(--toss-gray-500);
  line-height: 1.3;
}

/* 카테고리 */
.category-section {
  margin-bottom: 24px;
}

.category-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-gray-500);
  margin-bottom: 10px;
  padding-left: 2px;
}

.wiki-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .wiki-grid {
    grid-template-columns: 1fr;
  }
}

/* 카드 */
.wiki-card {
  padding: 18px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0 !important;
}

.wiki-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.wiki-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.wiki-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wiki-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 4px;
}

.wiki-summary {
  font-size: 12px;
  color: var(--toss-gray-500);
  line-height: 1.5;
  padding-right: 20px;
}

.wiki-arrow {
  position: absolute;
  right: 14px;
  bottom: 14px;
}
</style>
