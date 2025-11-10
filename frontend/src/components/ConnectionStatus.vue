<template>
  <div class="connection-status" :class="statusClass">
    <div class="status-indicator"></div>
    <span class="status-message">{{ statusMessage }}</span>
    <button
      v-if="showRetry"
      @click="testConnection"
      class="retry-btn"
      :disabled="isRetrying"
    >
      {{ isRetrying ? '重试中...' : '重试连接' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { checkApiConnection } from '../services/apiService'

const isConnected = ref(false)
const isRetrying = ref(false)
const statusMessage = ref('检测后端连接状态...')
const statusClass = ref('checking')
const showRetry = ref(false)

let checkInterval: number | null = null

const statusClassMap = {
  connected: 'connected',
  disconnected: 'disconnected',
  checking: 'checking',
  error: 'error'
}

const testConnection = async () => {
  isRetrying.value = true
  statusMessage.value = '正在连接后端服务...'
  statusClass.value = 'checking'
  showRetry.value = false

  try {
    const result = await checkApiConnection()

    if (result.isConnected) {
      isConnected.value = true
      statusMessage.value = '后端服务正常'
      statusClass.value = 'connected'
      showRetry.value = false
    } else {
      isConnected.value = false
      statusMessage.value = result.error || '后端服务连接失败'
      statusClass.value = 'disconnected'
      showRetry.value = true
    }
  } catch (error) {
    isConnected.value = false
    statusMessage.value = '连接检测失败'
    statusClass.value = 'error'
    showRetry.value = true
  } finally {
    isRetrying.value = false
  }
}

onMounted(() => {
  // 立即检测一次
  testConnection()

  // 每30秒检测一次连接状态
  checkInterval = window.setInterval(testConnection, 30000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
})

// 暴露给父组件的方法
defineExpose({
  testConnection,
  isConnected
})
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-message {
  flex: 1;
  font-weight: 500;
}

.retry-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 状态样式 */
.checking {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.checking .status-indicator {
  background-color: #f59e0b;
}

.checking .retry-btn {
  background-color: #f59e0b;
  color: white;
}

.connected {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
}

.connected .status-indicator {
  background-color: #10b981;
}

.connected .retry-btn {
  background-color: #10b981;
  color: white;
}

.disconnected {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
}

.disconnected .status-indicator {
  background-color: #ef4444;
}

.disconnected .retry-btn {
  background-color: #ef4444;
  color: white;
}

.error {
  background-color: #fef3f3;
  color: #7f1d1d;
  border: 1px solid #fca5a5;
}

.error .status-indicator {
  background-color: #dc2626;
}

.error .retry-btn {
  background-color: #dc2626;
  color: white;
}

.retry-btn:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>