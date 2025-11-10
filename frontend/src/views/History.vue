<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          扫描历史记录
        </h2>
        <p class="text-gray-600 mb-4">
          查看所有模型扫描的历史记录和结果
        </p>
        <div class="flex justify-center gap-4">
          <button
            @click="refreshHistory"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              刷新中...
            </span>
            <span v-else>刷新记录</span>
          </button>
          <button
            @click="clearHistory"
            :disabled="isLoading || scanHistory.length === 0"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            清除历史
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && scanHistory.length === 0" class="text-center py-12">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600">正在加载扫描历史...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="scanHistory.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无扫描记录</h3>
        <p class="text-gray-600 mb-4">开始扫描您的第一个模型文件</p>
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          开始扫描
        </router-link>
      </div>

      <!-- Scan History -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="text-2xl font-bold text-gray-900">{{ scanHistory.length }}</div>
            <div class="text-sm text-gray-600">总扫描次数</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="text-2xl font-bold text-red-600">{{ totalCriticalIssues }}</div>
            <div class="text-sm text-gray-600">严重问题</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="text-2xl font-bold text-orange-600">{{ totalHighIssues }}</div>
            <div class="text-sm text-gray-600">高风险问题</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="text-2xl font-bold text-yellow-600">{{ totalMediumIssues }}</div>
            <div class="text-sm text-gray-600">中等问题</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="text-2xl font-bold text-blue-600">{{ totalLowIssues }}</div>
            <div class="text-sm text-gray-600">轻微问题</div>
          </div>
        </div>

        <!-- History List -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">扫描记录列表</h3>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="(scan, index) in scanHistory"
              :key="scan.scanId || index"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- File Info -->
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="text-lg font-medium text-gray-900">{{ scan.fileName }}</h4>
                    <span
                      :class="getScannerBadgeClass(scan.scanner)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ scan.scanner }}
                    </span>
                    <span
                      :class="getRiskLevelBadgeClass(scan)"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ getRiskLevelText(scan) }}
                    </span>
                  </div>

                  <!-- Scan Details -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span class="font-medium">模型类型:</span>
                      <div>{{ scan.modelInfo?.framework || 'Unknown' }}</div>
                    </div>
                    <div>
                      <span class="font-medium">格式:</span>
                      <div>{{ scan.modelInfo?.format || 'Unknown' }}</div>
                    </div>
                    <div>
                      <span class="font-medium">扫描时间:</span>
                      <div>{{ formatScanTime(scan.scanTime) }}</div>
                    </div>
                    <div>
                      <span class="font-medium">发现问题:</span>
                      <div class="font-bold text-red-600">{{ scan.totalIssues }} 个</div>
                    </div>
                  </div>

                  <!-- Issues Preview -->
                  <div v-if="scan.issues.length > 0" class="flex flex-wrap gap-2">
                    <div
                      v-for="issue in scan.issues.slice(0, 3)"
                      :key="issue.title"
                      :class="getSeverityBadgeClass(issue.severity)"
                      class="px-2 py-1 text-xs rounded-full"
                    >
                      {{ issue.title }}
                    </div>
                    <div
                      v-if="scan.issues.length > 3"
                      class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      +{{ scan.issues.length - 3 }} 更多
                    </div>
                  </div>

                  <div v-else class="text-sm text-green-600">
                    ✓ 未发现安全问题
                  </div>
                </div>

                <!-- Actions -->
                <div class="ml-4 flex flex-col gap-2">
                  <button
                    @click="viewDetails(scan)"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    @click="rescan(scan)"
                    :disabled="isScanning"
                    class="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    重新扫描
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scan Details Modal -->
      <div
        v-if="selectedScan"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="selectedScan = null"
      >
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ selectedScan.fileName }}</h3>
                <div class="flex gap-2">
                  <span :class="getScannerBadgeClass(selectedScan.scanner)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ selectedScan.scanner }}
                  </span>
                  <span :class="getStatusBadgeClass(selectedScan.totalIssues)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getStatusText(selectedScan.totalIssues) }}
                  </span>
                </div>
              </div>
              <button
                @click="selectedScan = null"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <!-- Summary -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ selectedScan.totalIssues }}</div>
                <div class="text-sm text-gray-600">总问题数</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{{ selectedScan.criticalIssues }}</div>
                <div class="text-sm text-gray-600">严重问题</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ selectedScan.highIssues || 0 }}</div>
                <div class="text-sm text-gray-600">高风险问题</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">{{ selectedScan.mediumIssues }}</div>
                <div class="text-sm text-gray-600">中等问题</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ selectedScan.lowIssues }}</div>
                <div class="text-sm text-gray-600">轻微问题</div>
              </div>
            </div>

            <!-- Issues List -->
            <div v-if="selectedScan.issues.length > 0">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">问题详情</h4>
              <div class="space-y-4">
                <div
                  v-for="issue in selectedScan.issues"
                  :key="issue.title"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h5 :class="getSeverityTextClass(issue.severity)" class="font-medium">
                      {{ issue.title }}
                    </h5>
                    <span :class="getSeverityBadgeClass(issue.severity)" class="px-2 py-1 text-xs rounded-full">
                      {{ issue.severity }}
                    </span>
                  </div>
                  <p class="text-gray-600 mb-2">{{ issue.description }}</p>
                  <div v-if="issue.location" class="text-sm text-gray-500">
                    <strong>位置:</strong> {{ issue.location }}
                  </div>
                  <div v-if="issue.recommendation" class="text-sm text-blue-600 mt-2">
                    <strong>建议:</strong> {{ issue.recommendation }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-green-600">
              ✓ 未发现安全问题
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService, type ScanHistory, type ScanResult } from '../services/apiService'

interface ScanRecord {
  scanId?: string
  fileName: string
  scanner: 'TensorDetect' | 'ModelScan'
  totalIssues: number
  criticalIssues: number
  mediumIssues: number
  lowIssues: number
  highIssues?: number
  scanTime: number
  modelInfo?: {
    framework: string
    format: string
    size?: string
  }
  issues: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    location?: string
    recommendation?: string
  }>
}

const scanHistory = ref<ScanRecord[]>([])
const isLoading = ref(false)
const selectedScan = ref<ScanRecord | null>(null)
const isScanning = ref(false)

// Computed properties
const totalCriticalIssues = computed(() =>
  scanHistory.value.reduce((sum, scan) => sum + scan.criticalIssues, 0)
)

const totalHighIssues = computed(() =>
  scanHistory.value.reduce((sum, scan) => sum + (scan.highIssues || 0), 0)
)

const totalMediumIssues = computed(() =>
  scanHistory.value.reduce((sum, scan) => sum + scan.mediumIssues, 0)
)

const totalLowIssues = computed(() =>
  scanHistory.value.reduce((sum, scan) => sum + scan.lowIssues, 0)
)

// Methods
const refreshHistory = async () => {
  isLoading.value = true
  try {
    const history = await apiService.getScanHistory()
    // 转换数据格式以匹配界面需求
    scanHistory.value = history.scans.map((scan: any) => ({
      scanId: scan.scan_id,
      fileName: scan.filename,
      scanner: scan.scanner_used === 'TensorDetect' ? 'TensorDetect' : 'ModelScan',
      totalIssues: scan.total_issues,
      criticalIssues: scan.issues_by_severity?.CRITICAL || 0,
      highIssues: scan.issues_by_severity?.HIGH || 0,
      mediumIssues: scan.issues_by_severity?.MEDIUM || 0,
      lowIssues: scan.issues_by_severity?.LOW || 0,
      scanTime: new Date(scan.scan_time).getTime(),
      modelInfo: {
        framework: scan.model_type?.includes('TensorFlow') ? 'TensorFlow' : 'Other',
        format: scan.model_type
      },
      issues: scan.issues.map((issue: any) => {
        // ModelScan severity数字到字符串的映射
        const severityMap: Record<number, string> = {
          1: 'LOW',
          2: 'MEDIUM',
          3: 'HIGH',
          4: 'CRITICAL'
        }

        let severityStr = String(issue.severity || 'unknown').toUpperCase()
        // 如果是数字，使用映射表转换
        if (!isNaN(Number(issue.severity))) {
          severityStr = severityMap[Number(issue.severity)] || 'UNKNOWN'
        }

        return {
          severity: severityStr,
          title: issue.operator || issue.op || 'Unknown',
          description: issue.description,
          location: issue.location
        }
      })
    })).sort((a, b) => b.scanTime - a.scanTime) // 按时间倒序
  } catch (error) {
    console.error('获取扫描历史失败:', error)
  } finally {
    isLoading.value = false
  }
}

const clearHistory = async () => {
  if (!confirm('确定要清除所有扫描历史记录吗？此操作不可撤销。')) {
    return
  }

  try {
    await apiService.clearScanHistory()
    // 清除成功后，重新加载历史记录
    await refreshHistory()
  } catch (error) {
    console.error('清除历史记录失败:', error)
    alert('清除历史记录失败，请稍后重试')
  }
}

const viewDetails = (scan: ScanRecord) => {
  selectedScan.value = scan
}

const rescan = (scan: ScanRecord) => {
  // 这里可以实现重新扫描的逻辑
  // 例如导航到首页并触发文件选择
  console.log('重新扫描:', scan.fileName)
}

// Utility functions
const getScannerBadgeClass = (scanner: string): string => {
  return scanner === 'TensorDetect'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800'
}

const getStatusBadgeClass = (issues: number): string => {
  if (issues === 0) return 'bg-green-100 text-green-800'
  if (issues > 5) return 'bg-red-100 text-red-800'
  if (issues > 2) return 'bg-yellow-100 text-yellow-800'
  return 'bg-blue-100 text-blue-800'
}

const getStatusText = (issues: number): string => {
  if (issues === 0) return '安全'
  if (issues > 5) return '高风险'
  if (issues > 2) return '中风险'
  return '低风险'
}

const getRiskLevelBadgeClass = (scan: ScanRecord): string => {
  if (scan.totalIssues === 0) return 'bg-green-100 text-green-800'

  // 检查是否有严重级别问题
  if (scan.criticalIssues > 0) return 'bg-red-100 text-red-800'

  // 检查是否有高级别问题
  if (scan.highIssues && scan.highIssues > 0) return 'bg-orange-100 text-orange-800'

  // 检查是否有中等级别问题
  if (scan.mediumIssues > 0) return 'bg-yellow-100 text-yellow-800'

  // 只有轻微问题
  return 'bg-blue-100 text-blue-800'
}

const getRiskLevelText = (scan: ScanRecord): string => {
  if (scan.totalIssues === 0) return '安全'

  // 检查是否有严重级别问题
  if (scan.criticalIssues > 0) return '严重风险'

  // 检查是否有高级别问题
  if (scan.highIssues && scan.highIssues > 0) return '高风险'

  // 检查是否有中等级别问题
  if (scan.mediumIssues > 0) return '中风险'

  // 只有轻微问题
  return '低风险'
}

const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'LOW':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSeverityTextClass = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'text-red-800'
    case 'HIGH':
      return 'text-orange-800'
    case 'MEDIUM':
      return 'text-yellow-800'
    case 'LOW':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

const formatScanTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// Lifecycle
onMounted(() => {
  refreshHistory()
})
</script>