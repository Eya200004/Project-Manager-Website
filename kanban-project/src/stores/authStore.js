// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  // Initialisation - Observer les changements d'état d'authentification
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
      } else {
        user.value = null;
      }
      loading.value = false;
    });
  };

  // Inscription avec Email/Password
  const register = async (email, password) => {
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      error.value = handleAuthError(err);
      throw error.value;
    }
  };

  // Connexion avec Email/Password
  const login = async (email, password) => {
    try {
      error.value = null;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      error.value = handleAuthError(err);
      throw error.value;
    }
  };

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      error.value = null;
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      error.value = handleAuthError(err);
      throw error.value;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      error.value = null;
      await signOut(auth);
      user.value = null;
    } catch (err) {
      error.value = handleAuthError(err);
      throw error.value;
    }
  };

  // Gestion des erreurs Firebase
  const handleAuthError = (err) => {
    const errorMessages = {
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/user-not-found': 'Aucun compte avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/popup-closed-by-user': 'Connexion annulée',
      'auth/cancelled-popup-request': 'Connexion annulée'
    };
    return errorMessages[err.code] || 'Une erreur est survenue';
  };

  // Getters
  const isAuthenticated = () => !!user.value;

  return {
    // State
    user,
    loading,
    error,
    
    // Actions
    initAuth,
    register,
    login,
    loginWithGoogle,
    logout,
    
    // Getters
    isAuthenticated
  };
});