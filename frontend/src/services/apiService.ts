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