<template>
  <div class="select-wrapper" ref="wrapperRef">
    <button type="button" class="select-trigger" @click="open = !open" :class="{ active: open }">
      <span class="select-value">{{ selectedLabel }}</span>
      <ChevronDown :size="16" class="select-arrow" :class="{ rotated: open }" />
    </button>
    <Transition name="dropdown">
      <div v-if="open" class="select-dropdown">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="select-option"
          :class="{ selected: modelValue === opt.value }"
          @click="select(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <Check v-if="modelValue === opt.value" :size="15" class="check-icon" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Check } from '@lucide/vue';

const props = defineProps({
  modelValue: [String, Number],
  options: Array, // [{ value, label }]
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const wrapperRef = ref(null);

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue);
  return found ? found.label : '선택하세요';
});

function select(val) {
  emit('update:modelValue', val);
  open.value = false;
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.select-wrapper {
  position: relative;
  width: 100%;
}

.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border: 1.5px solid var(--toss-gray-200);
  border-radius: 12px;
  background: var(--toss-gray-50);
  font-size: 14px;
  font-family: inherit;
  color: var(--toss-gray-900);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-trigger:hover {
  border-color: var(--toss-gray-300);
}

.select-trigger.active {
  border-color: var(--toss-blue);
  background: white;
  box-shadow: 0 0 0 3px rgba(49,130,246,0.08);
}

.select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-arrow {
  color: var(--toss-gray-400);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--toss-gray-200);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
  z-index: 60;
  max-height: 240px;
  overflow-y: auto;
}

.select-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: var(--toss-gray-800);
  cursor: pointer;
  transition: background 0.12s ease;
}

.select-option:hover {
  background: var(--toss-gray-50);
}

.select-option.selected {
  color: var(--toss-blue);
  font-weight: 600;
  background: rgba(49,130,246,0.06);
}

.check-icon {
  color: var(--toss-blue);
  flex-shrink: 0;
}

/* 트랜지션 */
.dropdown-enter-active {
  transition: all 0.15s ease-out;
}

.dropdown-leave-active {
  transition: all 0.1s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
