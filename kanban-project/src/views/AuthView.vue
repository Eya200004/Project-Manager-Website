<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoginMode = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const localError = ref('');

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  localError.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const validateForm = () => {
  if (!email.value || !password.value){
    localError.value = 'Veuillez remplir tous les champs';
    return false;
  }
  if (!isLoginMode.value && password.value !== confirmPassword.value){
    localError.value = 'Les mots de passe ne correspondent pas';
    return false;
  }
  if (password.value.length < 6){
    localError.value = 'Le mot de passe doit contenir au moins 6 caractères';
    return false;
  }
  return true;
};

const handleEmailAuth = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    localError.value = '';

    if (isLoginMode.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(email.value, password.value);
    }

    // Redirection après connexion
    const redirectTo = route.query.redirect || '/dashboard';
    router.push(redirectTo);
  } catch (error) {
    localError.value = authStore.error || error.message;
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleAuth = async () => {
  try {
    isLoading.value = true;
    localError.value = '';
    
    await authStore.loginWithGoogle();
    
    const redirectTo = route.query.redirect || '/dashboard';
    router.push(redirectTo);
  } catch (error) {
    localError.value = authStore.error || error.message;
  } finally {
    isLoading.value = false;
  }
};

const title = computed(() => isLoginMode.value ? 'Connexion' : 'Inscription');
const buttonText = computed(() => isLoginMode.value ? 'Se connecter' : "S'inscrire");
const switchText = computed(() => 
  isLoginMode.value 
    ? "Pas encore de compte ? Inscrivez-vous" 
    : "Déjà un compte ? Connectez-vous"
);
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title }}</h1>
        <p class="text-gray-600">Gérez vos projets efficacement</p>
      </div>

      <!-- Erreur -->
      <div v-if="localError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm">{{ localError }}</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleEmailAuth" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="votreemail@exemple.com"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <div v-if="!isLoginMode">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">{{ buttonText }}</span>
          <span v-else>Chargement...</span>
        </button>
      </form>
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">Ou continuer avec</span>
        </div>
      </div>
      <!-- google auth -->
      <button
        @click="handleGoogleAuth"
        type="button"
        class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        :disabled="isLoading"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span class="font-medium text-gray-700">Google</span>
      </button>
      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <button
          @click="toggleMode"
          type="button"
          class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          :disabled="isLoading"
        >
          {{ switchText }}
        </button>
      </div>
    </div>
  </div>
</template>