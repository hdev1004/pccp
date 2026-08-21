<template>
  <div class="app">
    <template v-if="auth.isLoggedIn">
      <Navbar />
      <main class="page-container">
        <router-view />
      </main>
    </template>
    <router-view v-else />
    <Toast />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';
import Toast from './components/Toast.vue';

const auth = useAuthStore();
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--toss-gray-50);
}
</style>
