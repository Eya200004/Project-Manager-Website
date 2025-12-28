<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'statusChange']);

const showMenu = ref(false);

const statusColors = {
  todo: 'bg-gray-100 text-gray-700',
  doing: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700'
};

const statusLabels = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Terminé'
};

const isOverdue = computed(() => {
  if (!props.task.deadline) return false;
  const deadline = new Date(props.task.deadline);
  const now = new Date();
  return deadline < now && props.task.status !== 'done';
});

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
};

const handleEdit = () => {
  showMenu.value = false;
  emit('edit', props.task);
};

const handleDelete = () => {
  showMenu.value = false;
  emit('delete', props.task);
};

const changeStatus = (newStatus) => {
  if (newStatus !== props.task.status) {
    emit('statusChange', props.task, newStatus);
  }
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};
</script>

<template>
  <div 
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-200 group"
    draggable="true"
    @dragstart="$emit('dragstart', task)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 mb-1 pr-2">
          {{ task.title }}
        </h3>
        <span 
          :class="statusColors[task.status]"
          class="inline-block px-2 py-1 rounded-md text-xs font-medium"
        >
          {{ statusLabels[task.status] }}
        </span>
      </div>
      
      <!-- Menu -->
      <div class="relative">
        <button
          @click="toggleMenu"
          @blur="closeMenu"
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-show="showMenu"
          @mousedown.prevent="showMenu = true"
          class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200"
        >
          <!-- Status Changes -->
          <div class="px-3 py-2 border-b border-gray-100">
            <p class="text-xs font-medium text-gray-500 mb-1">Changer le statut</p>
            <button
              v-if="task.status !== 'todo'"
              @click="changeStatus('todo')"
              class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded transition"
            >
              → À faire
            </button>
            <button
              v-if="task.status !== 'doing'"
              @click="changeStatus('doing')"
              class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded transition"
            >
              → En cours
            </button>
            <button
              v-if="task.status !== 'done'"
              @click="changeStatus('done')"
              class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded transition"
            >
              → Terminé
            </button>
          </div>

          <!-- Actions -->
          <button
            @click="handleEdit"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Modifier
          </button>
          <button
            @click="handleDelete"
            class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Footer -->
    <div v-if="task.deadline" class="flex items-center gap-2 text-xs">
      <svg class="w-4 h-4" :class="isOverdue ? 'text-red-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span :class="isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'">
        {{ formatDate(task.deadline) }}
        <span v-if="isOverdue" class="ml-1">(En retard)</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>