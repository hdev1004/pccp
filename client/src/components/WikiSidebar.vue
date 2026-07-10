<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <BookOpen :size="18" color="var(--toss-blue)" />
      <span>목차</span>
    </div>
    <div v-for="cat in categories" :key="cat" class="sidebar-group">
      <div class="sidebar-category">{{ cat }}</div>
      <router-link
        v-for="item in getByCategory(cat)"
        :key="item.id"
        :to="`/wiki/${item.id}`"
        class="sidebar-item"
        :class="{ active: activeId === item.id }"
      >
        <component :is="getIcon(item.icon)" :size="14" :color="item.color" />
        <span>{{ item.title }}</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import {
  BookOpen, Clock, List, Type, Hash,
  Layers, ArrowUpDown, ScanSearch, Zap, GitBranch, Puzzle, Triangle
} from '@lucide/vue';

const props = defineProps({
  activeId: { type: String, default: '' },
});

const items = ref([]);

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
.sidebar {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 92px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--toss-gray-900);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--toss-gray-100);
}

.sidebar-group {
  margin-bottom: 16px;
}

.sidebar-group:last-child {
  margin-bottom: 0;
}

.sidebar-category {
  font-size: 11px;
  font-weight: 700;
  color: var(--toss-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  padding-left: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--toss-gray-700);
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: var(--toss-gray-50);
  color: var(--toss-gray-900);
}

.sidebar-item.active {
  background: rgba(49,130,246,0.08);
  color: var(--toss-blue);
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: static;
    max-height: none;
  }
}
</style>
