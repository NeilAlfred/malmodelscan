<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
      :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept=".h5,.pb,.pkl,.pt,.pth,.bin,.ckpt"
        @change="handleFileInput"
      />

      <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
          <p class="text-lg font-medium text-gray-900">
            {{ isLoading ? '处理中...' : '点击上传或拖拽文件到此处' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            支持 .h5, .pb, .pkl, .pt, .pth, .bin, .ckpt 格式
          </p>
        </div>

        <div class="flex items-center space-x-4 text-xs text-gray-400">
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>安全加密传输</span>
          </div>
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>本地扫描处理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- File Format Info -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div class="flex items-center space-x-2 text-gray-600">
        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span>TensorFlow</span>
      </div>
      <div class="flex items-center space-x-2 text-gray-600">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>PyTorch</span>
      </div>
      <div class="flex items-center space-x-2 text-gray-600">
        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span>Pickle</span>
      </div>
      <div class="flex items-center space-x-2 text-gray-600">
        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span>其他格式</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isLoading?: boolean
}

interface Emits {
  (e: 'fileSelected', file: File): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

const triggerFileInput = () => {
  if (!fileInput.value) return
  fileInput.value.click()
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    emit('fileSelected', file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}
</script>