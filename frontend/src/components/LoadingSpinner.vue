<template>
  <div class="flex flex-col items-center justify-center space-y-4">
    <div class="relative">
      <div class="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
      <div class="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
    </div>
    <div v-if="message" class="text-center">
      <p class="text-gray-600 font-medium">{{ message }}</p>
      <p v-if="subMessage" class="text-gray-500 text-sm mt-1">{{ subMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  subMessage?: string
}

defineProps<Props>()
</script>