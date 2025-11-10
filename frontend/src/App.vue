<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">MalModelScan</h1>
          </div>
          <nav class="flex items-center space-x-6">
            <router-link
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              模型扫描
            </router-link>
            <router-link
              to="/history"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              扫描历史
            </router-link>
            <div class="flex items-center space-x-2">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                <span :class="[
                  'w-1.5 h-1.5 rounded-full mr-1.5',
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                ]"></span>
                {{ isOnline ? '在线' : '离线' }}
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-500 text-sm">
          <p>&copy; 2024 MalModelScan. 专业的AI模型安全检查工具</p>
          <p class="mt-2">支持 TensorFlow、PyTorch 等主流模型格式</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { checkApiConnection } from './services/apiService'

const isOnline = ref(true)
let healthCheckInterval: number | null = null

const checkHealthStatus = async () => {
  try {
    const result = await checkApiConnection()
    isOnline.value = result.isConnected
  } catch (error) {
    console.warn('Health check failed:', error)
    isOnline.value = false
  }
}

const startHealthChecking = () => {
  // 立即检查一次
  checkHealthStatus()

  // 每30秒检查一次
  healthCheckInterval = window.setInterval(checkHealthStatus, 30000)
}

const stopHealthChecking = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
  }
}

onMounted(() => {
  startHealthChecking()
})

onUnmounted(() => {
  stopHealthChecking()
})
</script>