<template>
  <div class="cb" :class="'cb--' + currentTheme">
    <div class="cb-bar">
      <div class="cb-bar-left">
        <span class="cb-dot" style="background:#ff5f57"></span>
        <span class="cb-dot" style="background:#febc2e"></span>
        <span class="cb-dot" style="background:#28c840"></span>
        <span class="cb-lang">{{ language }}</span>
      </div>
      <div class="cb-themes">
        <button
          v-for="t in themes"
          :key="t.id"
          @click="setTheme(t.id)"
          class="cb-theme-btn"
          :class="{ active: currentTheme === t.id }"
        >{{ t.label }}</button>
      </div>
    </div>
    <pre class="cb-pre"><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);

const props = defineProps({
  code: String,
  language: { type: String, default: 'python' },
});

const themes = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'monokai', label: 'Monokai' },
];

const saved = localStorage.getItem('code-theme');
const currentTheme = ref(saved || 'dark');

function setTheme(id) {
  currentTheme.value = id;
  localStorage.setItem('code-theme', id);
}

const highlightedCode = computed(() => {
  try {
    return hljs.highlight(props.code || '', { language: props.language }).value;
  } catch {
    return props.code;
  }
});
</script>

<style>
/* ===== 공통 ===== */
.cb {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--toss-gray-200);
}

.cb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
}

.cb-bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cb-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.cb-lang {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
  opacity: 0.5;
}

.cb-themes {
  display: flex;
  gap: 2px;
  background: rgba(128,128,128,0.15);
  border-radius: 8px;
  padding: 2px;
}

.cb-theme-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background: transparent;
  transition: all 0.15s ease;
}

.cb-pre {
  padding: 18px 20px;
  margin: 0;
  overflow-x: auto;
  line-height: 1.75;
  font-size: 13px;
  font-family: 'D2Coding', 'D2 Coding', Consolas, monospace;
}

.cb-pre code {
  font-family: inherit;
  color: inherit;
}

/* ===== Dark ===== */
.cb--dark {
  border-color: #2a2b3d;
}

.cb--dark .cb-bar {
  background: #181926;
}

.cb--dark .cb-lang {
  color: #7f849c;
}

.cb--dark .cb-theme-btn {
  color: #7f849c;
}

.cb--dark .cb-theme-btn.active {
  background: rgba(255,255,255,0.1);
  color: #cdd6f4;
}

.cb--dark .cb-pre {
  background: #1e1e2e;
  color: #cdd6f4;
}

.cb--dark .hljs { color: #cdd6f4; }
.cb--dark .hljs-keyword { color: #cba6f7; font-weight: 600; }
.cb--dark .hljs-built_in { color: #f38ba8; }
.cb--dark .hljs-title.function_ { color: #89b4fa; }
.cb--dark .hljs-string { color: #a6e3a1; }
.cb--dark .hljs-number { color: #fab387; }
.cb--dark .hljs-comment { color: #6c7086; font-style: italic; }
.cb--dark .hljs-params { color: #f2cdcd; }
.cb--dark .hljs-operator { color: #89dceb; }
.cb--dark .hljs-literal { color: #fab387; }
.cb--dark .hljs-meta { color: #f5c2e7; }

/* ===== Light ===== */
.cb--light {
  border-color: var(--toss-gray-200);
}

.cb--light .cb-bar {
  background: #f6f8fa;
  border-bottom: 1px solid var(--toss-gray-200);
}

.cb--light .cb-lang {
  color: #8b949e;
}

.cb--light .cb-theme-btn {
  color: #8b949e;
}

.cb--light .cb-theme-btn.active {
  background: white;
  color: var(--toss-gray-900);
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.cb--light .cb-pre {
  background: #ffffff;
  color: #24292f;
}

.cb--light .hljs { color: #24292f; }
.cb--light .hljs-keyword { color: #cf222e; font-weight: 600; }
.cb--light .hljs-built_in { color: #8250df; }
.cb--light .hljs-title.function_ { color: #8250df; }
.cb--light .hljs-string { color: #0a3069; }
.cb--light .hljs-number { color: #0550ae; }
.cb--light .hljs-comment { color: #6e7781; font-style: italic; }
.cb--light .hljs-params { color: #953800; }
.cb--light .hljs-operator { color: #24292f; }
.cb--light .hljs-literal { color: #0550ae; }
.cb--light .hljs-meta { color: #0550ae; }

/* ===== Monokai ===== */
.cb--monokai {
  border-color: #3e3d32;
}

.cb--monokai .cb-bar {
  background: #1e1f1c;
}

.cb--monokai .cb-lang {
  color: #75715e;
}

.cb--monokai .cb-theme-btn {
  color: #75715e;
}

.cb--monokai .cb-theme-btn.active {
  background: rgba(255,255,255,0.08);
  color: #f8f8f2;
}

.cb--monokai .cb-pre {
  background: #272822;
  color: #f8f8f2;
}

.cb--monokai .hljs { color: #f8f8f2; }
.cb--monokai .hljs-keyword { color: #f92672; font-weight: 600; }
.cb--monokai .hljs-built_in { color: #66d9ef; }
.cb--monokai .hljs-title.function_ { color: #a6e22e; }
.cb--monokai .hljs-string { color: #e6db74; }
.cb--monokai .hljs-number { color: #ae81ff; }
.cb--monokai .hljs-comment { color: #75715e; font-style: italic; }
.cb--monokai .hljs-params { color: #fd971f; }
.cb--monokai .hljs-operator { color: #f92672; }
.cb--monokai .hljs-literal { color: #ae81ff; }
.cb--monokai .hljs-meta { color: #66d9ef; }
</style>
