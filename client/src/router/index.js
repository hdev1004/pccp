import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { auth: true },
  },
  {
    path: '/problems',
    name: 'Problems',
    component: () => import('../views/Problems.vue'),
    meta: { auth: true },
  },
  {
    path: '/problems/:id',
    name: 'ProblemDetail',
    component: () => import('../views/ProblemDetail.vue'),
    meta: { auth: true },
  },
  {
    path: '/quiz',
    name: 'QuizList',
    component: () => import('../views/QuizList.vue'),
    meta: { auth: true },
  },
  {
    path: '/quiz/:id',
    name: 'Quiz',
    component: () => import('../views/Quiz.vue'),
    meta: { auth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.auth && !auth.isLoggedIn) {
    next('/login');
  } else if (to.meta.guest && auth.isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
