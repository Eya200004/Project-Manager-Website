<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);

const handleLogout = async () => {
  try {
    await authStore.logout();
    showUserMenu.value = false;
    router.push('/');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  setTimeout(() => {
    showUserMenu.value = false;
  }, 200);
};
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80 transition">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TaskManager
            </span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-4">
          <!-- Non authentifié -->
          <template v-if="!authStore.isAuthenticated()">
            <router-link 
              to="/"
              class="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50"
            >
              Accueil
            </router-link>
            <router-link 
              to="/auth"
              class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
            >
              Connexion
            </router-link>
          </template>

          <!-- Authentifié -->
          <template v-else>
            <router-link 
              to="/dashboard"
              class="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50"
            >
              📊 Mes Projets
            </router-link>

            <!-- User Menu Dropdown -->
            <div class="relative">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50 border border-gray-200"
              >
                <!-- Avatar -->
                <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                  <img 
                    v-if="authStore.user?.photoURL" 
                    :src="authStore.user.photoURL" 
                    alt="Avatar"
                    class="w-9 h-9 rounded-full"
                  />
                  <span v-else class="text-white font-bold text-sm">
                    {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                
                <!-- Nom et icône -->
                <span class="hidden md:block font-medium">
                  {{ authStore.user?.displayName || authStore.user?.email?.split('@')[0] }}
                </span>
                
                <svg 
                  class="w-4 h-4 transition-transform" 
                  :class="{ 'rotate-180': showUserMenu }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition name="dropdown">
                <div
                  v-show="showUserMenu"
                  @click="closeUserMenu"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                >
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                      <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-indigo-100">
                        <img 
                          v-if="authStore.user?.photoURL" 
                          :src="authStore.user.photoURL" 
                          alt="Avatar"
                          class="w-12 h-12 rounded-full"
                        />
                        <span v-else class="text-white font-bold text-lg">
                          {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">
                          {{ authStore.user?.displayName || 'Utilisateur' }}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ authStore.user?.email }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-1">
                    <router-link
                      to="/dashboard"
                      @click="closeUserMenu"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                      </svg>
                      <span class="font-medium">Tableau de bord</span>
                    </router-link>
                  </div>

                  <!-- Divider -->
                  <div class="border-t border-gray-100 my-1"></div>

                  <!-- Logout Button -->
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>