import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '@/stores/authStore';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:id',
    name: 'project-details',
    component: () => import('@/views/ProjectDetails.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.loading) {
    const unwatch = authStore.$subscribe((mutation, state) => {
      if (!state.loading) {
        unwatch();
        handleNavigation();
      }
    });
  } else {
    handleNavigation();
  }
  function handleNavigation(){
    const requiresAuth = to.meta.requiresAuth;
    const guestOnly = to.meta.guestOnly;
    const isAuthenticated = authStore.isAuthenticated();

    if (requiresAuth && !isAuthenticated) {
      next({ name: 'auth', query: { redirect: to.fullPath } });
    } else if (guestOnly && isAuthenticated) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  }
});
export default router;