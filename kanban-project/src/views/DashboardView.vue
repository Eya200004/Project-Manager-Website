<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import ProjectModal from '@/components/ProjectModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const showModal = ref(false);
const selectedProject = ref(null);
const projectToDelete = ref(null);

onMounted(() => {
  projectStore.loadProjects();
});

onUnmounted(() => {
  projectStore.cleanup();
});

const openCreateModal = () => {
  selectedProject.value = null;
  showModal.value = true;
};

const openEditModal = (project) => {
  selectedProject.value = project;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedProject.value = null;
};

const confirmDelete = (project) => {
  projectToDelete.value = project;
};

const cancelDelete = () => {
  projectToDelete.value = null;
};

const deleteProject = async () => {
  if (!projectToDelete.value) return;
  
  try {
    await projectStore.deleteProject(projectToDelete.value.id);
    projectToDelete.value = null;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

const goToProject = (projectId) => {
  router.push(`/project/${projectId}`);
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          Mes Projets
        </h1>
        <p class="text-gray-600">
          Bienvenue {{ authStore.user?.displayName || authStore.user?.email }}
        </p>
      </div>

      <!-- Actions -->
      <div class="mb-8">
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau Projet
        </button>
      </div>

      <!-- Loading -->
      <div v-if="projectStore.loading && projectStore.projects.length === 0" class="text-center py-12">
        <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement des projets...</p>
      </div>

      <!-- Error -->
      <div v-else-if="projectStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-600">{{ projectStore.error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="projectStore.projects.length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun projet</h3>
        <p class="text-gray-600 mb-6">Créez votre premier projet pour commencer</p>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Créer un projet
        </button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
          @click="goToProject(project.id)"
        >
          <!-- Color Header -->
          <div 
            :style="{ backgroundColor: project.color }"
            class="h-2"
          ></div>

          <div class="p-6">
            <!-- Project Icon & Title -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div 
                  :style="{ backgroundColor: project.color }"
                  class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                >
                  {{ getInitials(project.name) }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">
                    {{ project.name }}
                  </h3>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
              {{ project.description || 'Aucune description' }}
            </p>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                @click.stop="openEditModal(project)"
                class="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Modifier
              </button>
              <button
                @click.stop="confirmDelete(project)"
                class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Modal -->
    <ProjectModal
      :show="showModal"
      :project="selectedProject"
      @close="closeModal"
      @success="closeModal"
    />

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="projectToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le projet <strong>{{ projectToDelete.name }}</strong> ? 
            Toutes les tâches associées seront également supprimées. Cette action est irréversible.
          </p>
          <div class="flex gap-3">
            <button
              @click="cancelDelete"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              @click="deleteProject"
              class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>