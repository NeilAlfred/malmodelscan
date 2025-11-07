export interface ScanRequest {
  file: File
  fileName: string
  fileSize: number
}

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

export interface ApiScanResult {
  scan_id: string
  filename: string
  model_type: string
  scanner_used: string
  total_issues: number
  issues_by_severity: Record<string, number>
  scan_time: string
  issues: ApiIssue[]
}

export interface ApiIssue {
  severity: string
  description: string
  operator: string
  location: string
  ability?: string
  op?: string
}

export interface ScanHistoryResponse {
  scans: ApiScanResult[]
  total_count: number
}

export interface ActiveScansResponse {
  active_scans: Array<{
    scan_id: string
    status: string
    progress: number
    message: string
  }>
  count: number
}

export class ApiService {
  private baseUrl: string
  private static instance: ApiService

  constructor(baseUrl: string = 'http://localhost:5180') {
    this.baseUrl = baseUrl
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async uploadModel(file: File): Promise<ScanResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.fetchWithTimeout('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('Upload failed:', response.status, response.statusText, error)
      console.error('Error details:', JSON.stringify(error, null, 2))

      let errorMessage = `上传失败: ${response.statusText} (${response.status})`
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((err: any) => err.msg || JSON.stringify(err)).join('; ')
        } else if (typeof error.detail === 'string') {
          errorMessage = error.detail
        } else {
          errorMessage = JSON.stringify(error.detail)
        }
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async getScanStatus(scanId: string): Promise<ScanStatus> {
    const response = await this.fetchWithTimeout(`/api/scan/status/${scanId}`)

    if (!response.ok) {
      throw new Error(`获取扫描状态失败: ${response.statusText}`)
    }

    return response.json()
  }

  async getScanResult(scanId: string): Promise<ApiScanResult> {
    const response = await this.fetchWithTimeout(`/api/scan/result/${scanId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('扫描结果未找到')
      }
      let errorDetail = `获取扫描结果失败: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          errorDetail = errorData.detail
        }
      } catch (e) {
        // JSON 解析失败，使用默认错误信息
      }
      throw new Error(errorDetail)
    }

    return response.json()
  }

  async getScanHistory(): Promise<ScanHistoryResponse> {
    const response = await this.fetchWithTimeout('/api/scans/history')

    if (!response.ok) {
      throw new Error(`获取扫描历史失败: ${response.statusText}`)
    }

    return response.json()
  }

  async getActiveScans(): Promise<ActiveScansResponse> {
    const response = await this.fetchWithTimeout('/api/scans/active')

    if (!response.ok) {
      throw new Error(`获取活跃扫描失败: ${response.statusText}`)
    }

    return response.json()
  }

  async clearScanHistory(): Promise<{ message: string }> {
    const response = await this.fetchWithTimeout('/api/scans/history', {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`清除扫描历史失败: ${response.statusText}`)
    }

    return response.json()
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    // 健康检查使用较短的超时时间，并支持重试
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout('/health', {}, 5000) // 5秒超时

        if (!response.ok) {
          throw new Error(`健康检查失败: ${response.statusText}`)
        }

        return response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.log(`Health check attempt ${attempt} failed:`, lastError.message)

        if (attempt < maxRetries) {
          // 等待重试，时间逐渐增加
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    throw lastError || new Error('健康检查失败')
  }

  // 轮询扫描状态直到完成
  async pollScanStatus(
    scanId: string,
    onProgress?: (status: ScanStatus) => void,
    pollingInterval: number = 2000,
    timeout: number = 300000 // 5分钟超时
  ): Promise<ApiScanResult> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getScanStatus(scanId)
        onProgress?.(status)

        if (status.status === 'completed') {
          return await this.getScanResult(scanId)
        }

        if (status.status === 'failed') {
          throw new Error(status.message || '扫描失败')
        }

        // 如果还在进行中，等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, pollingInterval))
      } catch (error) {
        // 如果是网络错误，继续轮询
        if (error instanceof TypeError) {
          await new Promise(resolve => setTimeout(resolve, pollingInterval))
          continue
        }
        throw error
      }
    }

    throw new Error('扫描超时')
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          // 只有当body不是FormData时才设置Content-Type为application/json
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      })
      return response
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

// 兼容旧接口的适配器
export class ScannerService {
  private static instance: ScannerService
  private api: ApiService

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService()
    }
    return ScannerService.instance
  }

  constructor() {
    this.api = ApiService.getInstance()
  }

  async scanModel(
    request: ScanRequest,
    onProgress?: (message: string) => void
  ): Promise<any> {
    try {
      // 首先检查后端是否可用
      await this.api.healthCheck()

      // 上传文件
      onProgress?.('正在上传模型文件...')
      const uploadResponse = await this.api.uploadModel(request.file)

      // 轮询扫描状态
      const result = await this.api.pollScanStatus(
        uploadResponse.scan_id,
        (status) => {
          if (status.message) {
            onProgress?.(status.message)
          }
        }
      )

      // 转换为前端期望的格式
      return this.convertApiResultToFrontendFormat(result)

    } catch (error) {
      console.error('API扫描失败:', error)

      // 如果后端不可用，回退到模拟数据
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('Failed to fetch'))) {
        console.log('后端不可用，使用模拟数据')
        return this.generateMockResult(request)
      }

      throw error
    }
  }

  async getHistory(): Promise<any[]> {
    try {
      await this.api.healthCheck()
      const history = await this.api.getScanHistory()
      return history.scans.map(scan => this.convertApiResultToFrontendFormat(scan))
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  }

  async clearScanHistory(): Promise<{ message: string }> {
    try {
      await this.api.healthCheck()
      return await this.api.clearScanHistory()
    } catch (error) {
      console.error('清除扫描历史失败:', error)
      throw error
    }
  }

  private convertApiResultToFrontendFormat(apiResult: ApiScanResult): any {
    console.log('DEBUG: API result issues:', apiResult.issues)

    const issues = apiResult.issues.map(issue => {
      console.log('DEBUG: Processing issue fields:', {
        op: issue.op,
        ability: issue.ability,
        location: issue.location,
        severity: issue.severity
      })

      const convertedIssue = {
        severity: this.normalizeSeverity(issue.severity),
        title: this.generateIssueTitle(issue.description, issue.operator),
        description: issue.description,
        location: issue.location,
        category: this.getCategoryFromOperator(issue.operator),
        cwe: this.getCWEFromIssue(issue),
        recommendation: this.getRecommendationFromIssue(issue),
        // 直接使用后端返回的op和ability字段
        op: issue.op,
        ability: issue.ability
      }

      console.log('DEBUG: Converted issue:', convertedIssue)
      return convertedIssue
    })

    // 计算各级别问题数量
    const severityCount = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('Severity count:', severityCount)
    console.log('Original issues severity:', apiResult.issues.map(i => i.severity))
    console.log('Normalized issues severity:', issues.map(i => i.severity))

    return {
      totalIssues: apiResult.total_issues,
      criticalIssues: severityCount['CRITICAL'] || 0,
      highIssues: severityCount['HIGH'] || 0,
      mediumIssues: severityCount['MEDIUM'] || 0,
      lowIssues: severityCount['LOW'] || 0,
      issues,
      scanner: apiResult.scanner_used as 'TensorDetect' | 'ModelScan',
      scanTime: new Date(apiResult.scan_time).getTime(),
      modelInfo: {
        framework: apiResult.model_type.includes('TensorFlow') ? 'TensorFlow' : 'Other',
        format: apiResult.model_type,
        size: 'Unknown'
      }
    }
  }

  private normalizeSeverity(severity: string | number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    // 处理数字格式的severity
    if (typeof severity === 'number') {
      if (severity >= 4) return 'CRITICAL'
      if (severity >= 3) return 'HIGH'
      if (severity >= 2) return 'MEDIUM'
      return 'LOW'
    }

    const upperSeverity = severity.toUpperCase()
    if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(upperSeverity)) {
      return upperSeverity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    }
    // 根据内容判断严重性
    if (severity.includes('critical') || severity.includes('严重')) return 'CRITICAL'
    if (severity.includes('high') || severity.includes('高')) return 'HIGH'
    if (severity.includes('medium') || severity.includes('中') || severity.includes('mid')) return 'MEDIUM'
    return 'LOW'
  }

  private generateIssueTitle(description: string, operator: string): string {
    if (operator && operator !== 'Unknown') {
      return `检测到可疑操作: ${operator}`
    }
    if (description.includes('Lambda')) return '检测到Lambda操作'
    if (description.includes('ReadFile')) return '检测到文件读取操作'
    if (description.includes('WriteFile')) return '检测到文件写入操作'
    if (description.includes('RpcCall')) return '检测到网络调用操作'
    return '安全风险检测'
  }

  private getCategoryFromOperator(operator: string): string {
    if (operator.includes('File')) return '文件操作'
    if (operator.includes('Rpc') || operator.includes('Network')) return '网络操作'
    if (operator.includes('Lambda')) return '代码注入'
    if (operator.includes('Load')) return '数据加载'
    return '其他风险'
  }

  private getCWEFromIssue(issue: any): string | undefined {
    const operator = issue.operator || ''
    const description = issue.description || ''

    if (operator.includes('Lambda') || description.includes('arbitrary code')) {
      return 'CWE-94'
    }
    if (operator.includes('ReadFile') || operator.includes('WriteFile')) {
      return 'CWE-22'
    }
    if (operator.includes('Rpc')) {
      return 'CWE-918'
    }
    return undefined
  }

  private getRecommendationFromIssue(issue: any): string {
    const operator = issue.operator || ''

    if (operator.includes('Lambda')) {
      return '移除或替换Lambda操作，使用安全的TensorFlow API'
    }
    if (operator.includes('ReadFile')) {
      return '验证文件读取操作的必要性，限制文件访问路径'
    }
    if (operator.includes('WriteFile')) {
      return '验证文件写入操作的安全性，限制写入路径'
    }
    if (operator.includes('Rpc')) {
      return '验证网络通信的合法性和安全性'
    }
    return '审查此操作的安全性'
  }

  
  // 模拟数据生成（作为后备方案）
  private async generateMockResult(request: ScanRequest): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const fileName = request.fileName.toLowerCase()
    const isTensorFlow = fileName.includes('.h5') || fileName.includes('.pb')

    const issues = [
      {
        severity: 'MEDIUM' as const,
        title: '模拟检测结果',
        description: '这是模拟的安全检测结果，实际扫描需要后端服务运行',
        category: '演示',
        recommendation: '启动后端服务以获得真实扫描结果'
      }
    ]

    return {
      totalIssues: issues.length,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 1,
      lowIssues: 0,
      issues,
      scanner: isTensorFlow ? 'TensorDetect' : 'ModelScan',
      scanTime: Date.now(),
      modelInfo: {
        framework: isTensorFlow ? 'TensorFlow' : 'Other',
        format: fileName.split('.').pop() || 'Unknown',
        size: this.formatFileSize(request.fileSize)
      }
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}