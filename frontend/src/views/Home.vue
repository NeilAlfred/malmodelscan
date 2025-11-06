<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          AI模型安全检查
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          上传您的AI模型文件，我们将自动检测潜在的安全风险和恶意代码
        </p>
      </div>

      <!-- Upload Section -->
      <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
        <FileUpload @file-selected="handleFileSelected" :is-loading="isScanning" />
      </div>

      <!-- File Info -->
      <div v-if="selectedFile" class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">文件信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span class="text-sm text-gray-500">文件名</span>
            <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500">文件大小</span>
            <p class="font-medium text-gray-900">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500">文件类型</span>
            <p class="font-medium text-gray-900">{{ getFileType(selectedFile.name) }}</p>
          </div>
        </div>
      </div>

      <!-- Scanning Progress -->
      <div v-if="isScanning" class="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">正在扫描模型文件...</h3>
          <p class="text-gray-600">{{ scanningMessage }}</p>
        </div>
      </div>

      <!-- Scan Results -->
      <div v-if="scanResults" class="space-y-6">
        <!-- Summary -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">扫描结果概览</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ scanResults.totalIssues }}</div>
              <div class="text-sm text-gray-600">总问题数</div>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ scanResults.criticalIssues }}</div>
              <div class="text-sm text-gray-600">严重问题</div>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ scanResults.mediumIssues }}</div>
              <div class="text-sm text-gray-600">中等问题</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ scanResults.lowIssues }}</div>
              <div class="text-sm text-gray-600">轻微问题</div>
            </div>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">详细检测结果</h3>
          <ScanResults :results="scanResults" />
        </div>
      </div>

      <!-- Info Section -->
      <div class="bg-white rounded-xl shadow-lg p-8 mt-12">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">支持的模型格式</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">TensorFlow 模型</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• .h5 - HDF5 格式</li>
              <li>• SavedModel 目录格式</li>
              <li>• .pb - Protocol Buffer 格式</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-2">PyTorch 及其他格式</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• .pkl - Pickle 格式</li>
              <li>• .pt/.pth - PyTorch 格式</li>
              <li>• .bin - 二进制格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from '@/components/FileUpload.vue'
import ScanResults from '@/components/ScanResults.vue'
import { ScannerService, type ScanResult } from '@/services/scanner'

interface ScanResults {
  totalIssues: number
  criticalIssues: number
  mediumIssues: number
  lowIssues: number
  issues: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    location?: string
  }>
  scanner: 'TensorDetect' | 'ModelScan'
}

const selectedFile = ref<File | null>(null)
const isScanning = ref(false)
const scanningMessage = ref('')
const scanResults = ref<ScanResults | null>(null)

const handleFileSelected = async (file: File) => {
  selectedFile.value = file
  isScanning.value = true
  scanResults.value = null

  try {
    const scannerService = ScannerService.getInstance()
    const result = await scannerService.scanModel(
      {
        file,
        fileName: file.name,
        fileSize: file.size
      },
      (message) => {
        scanningMessage.value = message
      }
    )

    scanResults.value = {
      totalIssues: result.totalIssues,
      criticalIssues: result.criticalIssues,
      mediumIssues: result.mediumIssues,
      lowIssues: result.lowIssues,
      issues: result.issues.map(issue => ({
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        location: issue.location
      })),
      scanner: result.scanner
    }
  } catch (error) {
    console.error('扫描失败:', error)
    // 显示错误信息
    alert('扫描失败，请稍后重试')
  } finally {
    isScanning.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'h5': 'TensorFlow HDF5',
    'pb': 'TensorFlow SavedModel',
    'pkl': 'Pickle',
    'pt': 'PyTorch',
    'pth': 'PyTorch',
    'bin': 'Binary',
    'ckpt': 'TensorFlow Checkpoint'
  }
  return typeMap[ext || ''] || 'Unknown'
}
</script>