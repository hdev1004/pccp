<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="'toast--' + t.type"
        >
          <CircleCheck v-if="t.type === 'success'" :size="16" />
          <AlertCircle v-else-if="t.type === 'error'" :size="16" />
          <Info v-else :size="16" />
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast';
import { CircleCheck, AlertCircle, Info } from '@lucide/vue';

const { toasts } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
  white-space: nowrap;
}

.toast--success {
  background: #e8f5e9;
  color: #2e7d32;
}

.toast--error {
  background: #ffeef0;
  color: #d32f2f;
}

.toast--info {
  background: #e3f2fd;
  color: #1565c0;
}

.toast-enter-active {
  transition: all 0.25s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
