<script setup>
import { ref, watch } from 'vue';
import { useProjectStore } from '@/stores/projectStore';

const props = defineProps({
  show: Boolean,
  project: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(['close', 'success']);
const projectStore = useProjectStore();

const formData = ref({
  name: '',
  description: '',
  color: '#6366f1'
});

const isLoading = ref(false);
const localError = ref('');

const colors = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Emeraude', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' }
];

watch(() => props.show, (newVal) =>{
  if (newVal) {
    if (props.project){
      formData.value ={
        name: props.project.name,
        description: props.project.description || '',
        color: props.project.color || '#6366f1'
      };
    } else{
      formData.value = {
        name: '',
        description: '',
        color: '#6366f1'
      };
    }
    localError.value = '';
  }
});
const handleSubmit = async () =>{
  if (!formData.value.name.trim()) {
    localError.value = 'Le nom du projet est requis';
    return;
  }

  try {
    isLoading.value = true;
    localError.value = '';

    if (props.project){
      await projectStore.updateProject(props.project.id, formData.value);
    } else {
      await projectStore.createProject(formData.value);
    }

    emit('success');
    emit('close');
  } catch (error){
    localError.value = error.message || 'Une erreur est survenue';
  } finally{
    isLoading.value = false;
  }
};

const handleClose = () => {
  if (!isLoading.value){
    emit('close');
  }
};
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ project ? 'Modifier le projet' : 'Nouveau projet' }}
          </h2>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition"
            :disabled="isLoading"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Error -->
        <div v-if="localError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ localError }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label for="projectName" class="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet *
            </label>
            <input
              id="projectName"
              v-model="formData.name"
              type="text"
              required
              maxlength="50"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Mon projet"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="projectDescription" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="projectDescription"
              v-model="formData.description"
              rows="3"
              maxlength="200"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Description de votre projet..."
              :disabled="isLoading"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Couleur du projet
            </label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="color in colors"
                :key="color.value"
                type="button"
                @click="formData.color = color.value"
                :style="{ backgroundColor: color.value }"
                class="w-full h-10 rounded-lg transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :class="{ 'ring-2 ring-offset-2 ring-gray-900': formData.color === color.value }"
                :disabled="isLoading"
                :title="color.name"
              ></button>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="handleClose"
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
              {{ isLoading ? 'Enregistrement...' : (project ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
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