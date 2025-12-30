<script setup>
defineProps({
  size:{
    type: String,
    default: 'md'
  },
  text:{
    type: String,
    default: ''
  }
});
const sizeClasses ={
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4'
};
</script>
<template>
  <div class="flex flex-col items-center justify-center">
    <div 
      :class="[sizeClasses[size],'border-indigo-600 border-t-transparent rounded-full animate-spin']"
    ></div>
    <p v-if="text" class="mt-4 text-gray-600">{{ text }}</p>
  </div>
</template>