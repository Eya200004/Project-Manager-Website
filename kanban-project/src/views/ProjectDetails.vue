<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import TaskCard from '@/components/TaskCard.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const showTaskModal = ref(false);
const selectedTask = ref(null);
const taskToDelete = ref(null);
const draggedTask = ref(null);

const taskForm = ref({
  title: '',
  description: '',
  deadline: '',
  status: 'todo'
});

const isLoading = ref(false);
const localError = ref('');

onMounted(async () => {
  try {
    await projectStore.loadProject(route.params.id);
    projectStore.loadTasks(route.params.id);
  } catch (error) {
    console.error('Erreur:', error);
    router.push('/dashboard');
  }
});

onUnmounted(() => {
  projectStore.cleanup();
});

const columns = [
  { id: 'todo', title: 'À faire', color: 'bg-gray-50 border-gray-200' },
  { id: 'doing', title: 'En cours', color: 'bg-blue-50 border-blue-200' },
  { id: 'done', title: 'Terminé', color: 'bg-green-50 border-green-200' }
];

const getTasksByStatus = (status) => {
  return projectStore.tasks.filter(task => task.status === status);
};

const openTaskModal = (status = 'todo', task = null) => {
  if (task) {
    selectedTask.value = task;
    taskForm.value = {
      title: task.title,
      description: task.description || '',
      deadline: task.deadline || '',
      status: task.status
    };
  } else {
    selectedTask.value = null;
    taskForm.value = {
      title: '',
      description: '',
      deadline: '',
      status: status
    };
  }
  localError.value = '';
  showTaskModal.value = true;
};

const closeTaskModal = () => {
  showTaskModal.value = false;
  selectedTask.value = null;
  taskForm.value = { title: '', description: '', deadline: '', status: 'todo' };
};

const handleSubmitTask = async () => {
  if (!taskForm.value.title.trim()) {
    localError.value = 'Le titre est requis';
    return;
  }

  try {
    isLoading.value = true;
    localError.value = '';

    if (selectedTask.value) {
      await projectStore.updateTask(route.params.id, selectedTask.value.id, taskForm.value);
    } else {
      await projectStore.createTask(route.params.id, taskForm.value);
    }

    closeTaskModal();
  } catch (error) {
    localError.value = error.message || 'Une erreur est survenue';
  } finally {
    isLoading.value = false;
  }
};

const confirmDeleteTask = (task) => {
  taskToDelete.value = task;
};

const cancelDeleteTask = () => {
  taskToDelete.value = null;
};

const deleteTask = async () => {
  if (!taskToDelete.value) return;
  
  try {
    await projectStore.deleteTask(route.params.id, taskToDelete.value.id);
    taskToDelete.value = null;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

const handleStatusChange = async (task, newStatus) => {
  try {
    await projectStore.updateTask(route.params.id, task.id, { status: newStatus });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
  }
};

// Drag and Drop
const handleDragStart = (task) => {
  draggedTask.value = task;
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const handleDrop = async (event, newStatus) => {
  event.preventDefault();
  
  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    await handleStatusChange(draggedTask.value, newStatus);
  }
  
  draggedTask.value = null;
};

const goBack = () => {
  router.push('/dashboard');
};

const stats = computed(() => {
  return {
    total: projectStore.tasks.length,
    todo: getTasksByStatus('todo').length,
    doing: getTasksByStatus('doing').length,
    done: getTasksByStatus('done').length
  };
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour aux projets
        </button>

        <div v-if="projectStore.currentProject" class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div 
              :style="{ backgroundColor: projectStore.currentProject.color }"
              class="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
            >
              {{ projectStore.currentProject.name.substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900">
                {{ projectStore.currentProject.name }}
              </h1>
              <p class="text-gray-600 mt-1">
                {{ projectStore.currentProject.description }}
              </p>
            </div>
          </div>

          <button
            @click="openTaskModal('todo')"
            class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle tâche
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">À faire</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.todo }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 border border-blue-200 bg-blue-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-700">En cours</p>
              <p class="text-2xl font-bold text-blue-900">{{ stats.doing }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 border border-green-200 bg-green-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-700">Terminé</p>
              <p class="text-2xl font-bold text-green-900">{{ stats.done }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          v-for="column in columns"
          :key="column.id"
          class="flex flex-col"
        >
          <!-- Column Header -->
          <div class="bg-white rounded-t-xl shadow-sm p-4 border-b-2" :class="column.color">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-900 text-lg">
                {{ column.title }}
                <span class="ml-2 text-sm font-normal text-gray-500">
                  ({{ getTasksByStatus(column.id).length }})
                </span>
              </h3>
              <button
                @click="openTaskModal(column.id)"
                class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Column Content -->
          <div
            @dragover="handleDragOver"
            @drop="handleDrop($event, column.id)"
            class="flex-1 bg-white rounded-b-xl shadow-sm p-4 space-y-3 min-h-[500px]"
            :class="column.color"
          >
            <TaskCard
              v-for="task in getTasksByStatus(column.id)"
              :key="task.id"
              :task="task"
              @edit="openTaskModal(column.id, task)"
              @delete="confirmDeleteTask"
              @status-change="handleStatusChange"
              @dragstart="handleDragStart(task)"
            />

            <!-- Empty State -->
            <div
              v-if="getTasksByStatus(column.id).length === 0"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p class="text-gray-500 text-sm">Aucune tâche</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <Transition name="modal">
      <div
        v-if="showTaskModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeTaskModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ selectedTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}
            </h2>
            <button
              @click="closeTaskModal"
              class="text-gray-400 hover:text-gray-600 transition"
              :disabled="isLoading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div v-if="localError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ localError }}</p>
          </div>

          <form @submit.prevent="handleSubmitTask" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                v-model="taskForm.title"
                type="text"
                required
                maxlength="100"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Titre de la tâche"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="taskForm.description"
                rows="4"
                maxlength="500"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                placeholder="Description de la tâche..."
                :disabled="isLoading"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date limite
              </label>
              <input
                v-model="taskForm.deadline"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                v-model="taskForm.status"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                :disabled="isLoading"
              >
                <option value="todo">À faire</option>
                <option value="doing">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeTaskModal"
                class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                :disabled="isLoading"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Enregistrement...' : (selectedTask ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="taskToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="cancelDeleteTask"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Supprimer la tâche</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer la tâche <strong>{{ taskToDelete.title }}</strong> ?
          </p>
          <div class="flex gap-3">
            <button
              @click="cancelDeleteTask"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              @click="deleteTask"
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>