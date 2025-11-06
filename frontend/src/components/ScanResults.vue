<template>
  <div class="space-y-4">
    <!-- Issues List -->
    <div v-if="results.issues.length > 0">
      <div class="space-y-3">
        <div
          v-for="(issue, index) in results.issues"
          :key="index"
          class="border rounded-lg p-4 transition-all hover:shadow-md"
          :class="getSeverityBorderClass(issue.severity)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getSeverityClass(issue.severity)"
                >
                  {{ getSeverityText(issue.severity) }}
                </span>
                <h4 class="text-base font-semibold text-gray-900">
                  {{ issue.title }}
                </h4>
              </div>

              <p class="text-gray-600 text-sm mb-2">
                {{ issue.description }}
              </p>

              <div v-if="issue.location" class="flex items-center space-x-2 text-xs text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>位置: {{ issue.location }}</span>
              </div>
            </div>

            <div class="ml-4">
              <button
                @click="toggleIssueDetail(index)"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  class="w-5 h-5 transform transition-transform"
                  :class="{ 'rotate-180': expandedIssues.has(index) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Issue Detail (Expandable) -->
          <div v-if="expandedIssues.has(index)" class="mt-4 pt-4 border-t border-gray-200">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="text-sm font-medium text-gray-900 mb-2">详细信息</h5>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">扫描引擎:</span>
                  <span>{{ results.scanner }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="font-medium">风险等级:</span>
                  <span>{{ getSeverityDescription(issue.severity) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="font-medium">建议操作:</span>
                  <span>{{ getRecommendation(issue.severity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Issues -->
    <div v-else class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">恭喜！未发现安全问题</h3>
      <p class="text-gray-600">该模型文件通过了安全检查，未检测到明显的安全威胁</p>
    </div>

    <!-- Export Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        @click="exportResults('json')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        导出 JSON
      </button>
      <button
        @click="exportResults('pdf')"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        导出 PDF 报告
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Issue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  location?: string
}

interface ScanResultsData {
  totalIssues: number
  criticalIssues: number
  mediumIssues: number
  lowIssues: number
  issues: Issue[]
  scanner: 'TensorDetect' | 'ModelScan'
}

interface Props {
  results: ScanResultsData
}

defineProps<Props>()

const expandedIssues = ref<Set<number>>(new Set())

const toggleIssueDetail = (index: number) => {
  if (expandedIssues.value.has(index)) {
    expandedIssues.value.delete(index)
  } else {
    expandedIssues.value.add(index)
  }
}

const getSeverityClass = (severity: string): string => {
  const classes = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800'
  }
  return classes[severity as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getSeverityBorderClass = (severity: string): string => {
  const classes = {
    CRITICAL: 'border-red-200 bg-red-50',
    HIGH: 'border-orange-200 bg-orange-50',
    MEDIUM: 'border-yellow-200 bg-yellow-50',
    LOW: 'border-blue-200 bg-blue-50'
  }
  return classes[severity as keyof typeof classes] || 'border-gray-200'
}

const getSeverityText = (severity: string): string => {
  const texts = {
    CRITICAL: '严重',
    HIGH: '高风险',
    MEDIUM: '中等',
    LOW: '轻微'
  }
  return texts[severity as keyof typeof texts] || '未知'
}

const getSeverityDescription = (severity: string): string => {
  const descriptions = {
    CRITICAL: '严重安全风险，可能导致系统被完全控制',
    HIGH: '高风险安全问题，可能导致数据泄露或系统损坏',
    MEDIUM: '中等安全风险，建议修复以提升安全性',
    LOW: '轻微安全问题，不影响核心功能但建议优化'
  }
  return descriptions[severity as keyof typeof descriptions] || '未知风险等级'
}

const getRecommendation = (severity: string): string => {
  const recommendations = {
    CRITICAL: '立即停止使用该模型，联系安全团队进行详细分析',
    HIGH: '谨慎使用，建议在隔离环境中测试并寻找替代方案',
    MEDIUM: '建议修复相关问题后再部署到生产环境',
    LOW: '可在生产环境使用，建议在下次更新时修复'
  }
  return recommendations[severity as keyof typeof recommendations] || '请联系安全团队获取建议'
}

const exportResults = (format: 'json' | 'pdf') => {
  // TODO: 实现导出功能
  console.log(`导出 ${format} 格式报告`)
}
</script>