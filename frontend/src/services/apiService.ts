import { appConfig } from '../config/environment'

/**
 * API 响应接口
 */
export interface ScanResponse {
  scan_id: string
  status: string
  message: string
}

export interface ScanStatus {
  scan_id: string
  status: string
  progress?: number
  message?: string
}

export interface ScanResult {
  scan_id: string
  filename: string
  model_type: string
  scanner_used: string
  total_issues: number
  issues_by_severity: Record<string, number>
  scan_time: string
  issues: Array<{
    severity: string
    description: string
    operator: string
    ability: string
    location: string
    op?: string
  }>
}

export interface ScanHistory {
  scans: ScanResult[]
  total_count: number
}

export interface HealthResponse {
  status: string
  timestamp: string
}

/**
 * API 服务类
 */
export class ApiService {
  private readonly baseURL: string
  private readonly timeout: number

  constructor() {
    this.baseURL = appConfig.apiBaseUrl
    this.timeout = 30000 // 30秒超时
  }

  /**
   * 发送 HTTP 请求的通用方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, url)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout', url)
      }

      if (error instanceof TypeError) {
        // 网络错误
        throw new NetworkError('无法连接到后端服务，请检查网络连接', url)
      }

      throw error
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  /**
   * 上传模型文件
   */
  async uploadModel(file: File): Promise<ScanResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<ScanResponse>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置 Content-Type
    })
  }

  /**
   * 获取扫描状态
   */
  async getScanStatus(scanId: string): Promise<ScanStatus> {
    return this.request<ScanStatus>(`/api/scan/status/${scanId}`)
  }

  /**
   * 获取扫描结果
   */
  async getScanResult(scanId: string): Promise<ScanResult> {
    return this.request<ScanResult>(`/api/scan/result/${scanId}`)
  }

  /**
   * 获取扫描历史
   */
  async getScanHistory(): Promise<ScanHistory> {
    return this.request<ScanHistory>('/api/scans/history')
  }

  /**
   * 清除扫描历史
   */
  async clearScanHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/scans/history', {
      method: 'DELETE',
    })
  }

  /**
   * 扫描模型文件（完整流程）
   * @param file 要扫描的文件
   * @param onProgress 进度回调函数
   * @returns 扫描结果
   */
  async scanModel(
    file: File,
    onProgress?: (message: string) => void
  ): Promise<any> {
    try {
      // 步骤1：上传文件
      onProgress?.('正在上传模型文件...')
      const uploadResponse = await this.uploadModel(file)

      // 步骤2：等待扫描完成
      onProgress?.('开始安全扫描...')
      const result = await this.waitForScanComplete(
        uploadResponse.scan_id,
        onProgress
      )

      return result
    } catch (error) {
      console.error('扫描失败:', error)
      if (error instanceof NetworkError) {
        throw new Error('网络连接失败，请检查后端服务是否正常运行')
      }
      if (error instanceof ApiError) {
        throw new Error(`扫描失败: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * 等待扫描完成
   * @param scanId 扫描ID
   * @param onProgress 进度回调函数
   * @returns 扫描结果
   */
  private async waitForScanComplete(
    scanId: string,
    onProgress?: (message: string) => void
  ): Promise<any> {
    const maxAttempts = 60 // 最多等待60次（约5分钟）
    const pollInterval = 5000 // 每5秒轮询一次

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getScanStatus(scanId)

        switch (status.status) {
          case 'queued':
            onProgress?.('扫描任务已排队，等待处理...')
            break
          case 'scanning':
            if (status.progress) {
              onProgress?.(`扫描中... ${status.progress}%`)
            } else {
              onProgress?.(status.message || '正在扫描模型文件...')
            }
            break
          case 'completed':
            onProgress?.('扫描完成，正在生成报告...')
            // 获取最终结果
            const result = await this.getScanResult(scanId)
            return this.formatScanResult(result)
          case 'failed':
            throw new Error(status.message || '扫描失败')
          default:
            onProgress?.('处理中...')
        }

        // 如果还在进行中，等待后继续轮询
        if (status.status !== 'completed' && status.status !== 'failed') {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // 扫描ID不存在，可能还在处理中
          onProgress?.('正在初始化扫描任务...')
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          continue
        }
        throw error
      }
    }

    throw new Error('扫描超时，请稍后重试')
  }

  /**
   * 格式化扫描结果以匹配前端期望的格式
   */
  private formatScanResult(result: ScanResult): any {
    // 统计各级别问题数量
    const severityCounts = result.issues.reduce((counts, issue) => {
      const severity = issue.severity.toUpperCase()
      counts[severity] = (counts[severity] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return {
      totalIssues: result.total_issues,
      criticalIssues: severityCounts['CRITICAL'] || 0,
      highIssues: severityCounts['HIGH'] || 0,
      mediumIssues: severityCounts['MEDIUM'] || 0,
      lowIssues: severityCounts['LOW'] || 0,
      issues: result.issues.map(issue => ({
        severity: issue.severity.toUpperCase(),
        title: issue.operator || issue.op || 'Unknown Operator',
        description: issue.description,
        location: issue.location,
        op: issue.op,
        ability: issue.ability
      })),
      scanner: result.scanner_used === 'TensorDetect' ? 'TensorDetect' : 'ModelScan',
      scanTime: new Date(result.scan_time).getTime(),
      modelInfo: {
        framework: result.model_type?.includes('TensorFlow') ? 'TensorFlow' : 'Other',
        format: result.model_type,
        size: 'Unknown' // 后端没有提供文件大小信息
      }
    }
  }

  /**
   * 获取活跃扫描
   */
  async getActiveScans(): Promise<{ active_scans: ScanStatus[]; count: number }> {
    return this.request<{ active_scans: ScanStatus[]; count: number }>('/api/scans/active')
  }
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public url: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends Error {
  constructor(message: string, public url: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * 单例 API 服务实例
 */
export const apiService = new ApiService()

/**
 * 检查 API 连接状态
 */
export const checkApiConnection = async (): Promise<{
  isConnected: boolean
  error?: string
}> => {
  try {
    await apiService.healthCheck()
    return { isConnected: true }
  } catch (error) {
    let errorMessage = '未知错误'

    if (error instanceof NetworkError) {
      errorMessage = error.message
    } else if (error instanceof ApiError) {
      errorMessage = `API 服务错误 (${error.status}): ${error.message}`
    }

    return { isConnected: false, error: errorMessage }
  }
}