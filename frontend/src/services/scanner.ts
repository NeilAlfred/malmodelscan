// 在真实场景中，这里会调用后端API
// 由于我们使用GitHub Pages部署，这里提供模拟数据或调用外部API

export interface ScanRequest {
  file: File
  fileName: string
  fileSize: number
}

export interface ScanResult {
  totalIssues: number
  criticalIssues: number
  highIssues: number
  mediumIssues: number
  lowIssues: number
  issues: SecurityIssue[]
  scanner: 'TensorDetect' | 'ModelScan'
  scanTime: number
  modelInfo?: ModelInfo
}

export interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  location?: string
  category: string
  cwe?: string
  recommendation: string
}

export interface ModelInfo {
  framework: string
  format: string
  size: string
  layers?: number
  parameters?: number
}

// 模拟扫描服务
export class ScannerService {
  private static instance: ScannerService

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService()
    }
    return ScannerService.instance
  }

  async scanModel(request: ScanRequest, onProgress?: (message: string) => void): Promise<ScanResult> {
    return new Promise((resolve) => {
      // 模拟扫描过程
      const steps = [
        '正在分析文件格式...',
        '正在加载模型结构...',
        '正在扫描恶意操作...',
        '正在检测安全漏洞...',
        '正在生成报告...'
      ]

      let currentStep = 0

      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          onProgress?.(steps[currentStep])
          currentStep++
        } else {
          clearInterval(interval)
          resolve(this.generateMockResults(request))
        }
      }, 800)
    })
  }

  private generateMockResults(request: ScanRequest): ScanResult {
    const fileName = request.fileName.toLowerCase()
    const isTensorFlow = fileName.includes('.h5') || fileName.includes('.pb') || fileName.includes('saved_model')

    // 根据文件类型生成不同的模拟结果
    const issues = this.generateIssuesByFormat(fileName)

    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      highIssues: issues.filter(i => i.severity === 'HIGH').length,
      mediumIssues: issues.filter(i => i.severity === 'MEDIUM').length,
      lowIssues: issues.filter(i => i.severity === 'LOW').length,
      issues,
      scanner: isTensorFlow ? 'TensorDetect' : 'ModelScan',
      scanTime: Math.floor(Math.random() * 3000) + 1000,
      modelInfo: {
        framework: isTensorFlow ? 'TensorFlow' : 'PyTorch/Other',
        format: this.getFormatFromFile(fileName),
        size: this.formatFileSize(request.fileSize),
        layers: Math.floor(Math.random() * 50) + 10,
        parameters: Math.floor(Math.random() * 1000000) + 100000
      }
    }
  }

  private generateIssuesByFormat(fileName: string): SecurityIssue[] {
    const commonIssues: SecurityIssue[] = [
      {
        severity: 'LOW',
        title: '模型缺少数字签名',
        description: '模型文件没有数字签名，无法验证模型的完整性和来源可信度',
        category: '完整性验证',
        recommendation: '为模型添加数字签名以确保模型来源可信'
      }
    ]

    if (fileName.includes('.h5') || fileName.includes('saved_model')) {
      return [
        ...commonIssues,
        {
          severity: 'CRITICAL',
          title: '检测到可疑的Lambda操作',
          description: '模型中包含可能执行任意代码的Lambda操作，存在代码注入风险',
          location: 'layer_1/lambda',
          category: '代码注入',
          cwe: 'CWE-94',
          recommendation: '立即移除或替换Lambda操作，使用安全的TensorFlow API'
        },
        {
          severity: 'MEDIUM',
          title: '使用已弃用的TensorFlow API',
          description: '模型使用了不推荐的TensorFlow 1.x API，存在兼容性和安全风险',
          location: 'model_config',
          category: 'API安全性',
          recommendation: '升级到TensorFlow 2.x并使用现代API'
        }
      ]
    } else if (fileName.includes('.pkl')) {
      return [
        ...commonIssues,
        {
          severity: 'HIGH',
          title: 'Pickle文件存在反序列化风险',
          description: 'Pickle文件可能包含恶意代码，反序列化时可能执行任意代码',
          category: '反序列化攻击',
          cwe: 'CWE-502',
          recommendation: '使用安全的序列化格式如JSON或使用可信来源的Pickle文件'
        },
        {
          severity: 'MEDIUM',
          title: '检测到自定义模块引用',
          description: '模型引用了外部自定义模块，可能包含未经验证的代码',
          location: 'module_references',
          category: '模块安全',
          recommendation: '验证所有引用模块的安全性'
        }
      ]
    } else if (fileName.includes('.pt') || fileName.includes('.pth')) {
      return [
        ...commonIssues,
        {
          severity: 'MEDIUM',
          title: '模型包含自定义操作',
          description: 'PyTorch模型包含自定义的torch.autograd.Function，可能存在安全风险',
          location: 'custom_ops',
          category: '自定义操作',
          recommendation: '审查自定义操作的安全性'
        }
      ]
    }

    return commonIssues
  }

  private getFormatFromFile(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const formatMap: Record<string, string> = {
      'h5': 'HDF5',
      'pb': 'Protocol Buffer',
      'pkl': 'Pickle',
      'pt': 'PyTorch',
      'pth': 'PyTorch',
      'bin': 'Binary',
      'ckpt': 'Checkpoint'
    }
    return formatMap[ext || ''] || 'Unknown'
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// 如果未来需要连接真实后端API，可以添加以下方法：
export class ApiScannerService {
  private baseUrl: string

  constructor(baseUrl: string = 'https://your-api-domain.com/api') {
    this.baseUrl = baseUrl
  }

  async scanModel(file: File, onProgress?: (message: string) => void): Promise<ScanResult> {
    const formData = new FormData()
    formData.append('model', file)

    try {
      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          // 不设置Content-Type，让浏览器自动设置multipart/form-data
        }
      })

      if (!response.ok) {
        throw new Error(`扫描失败: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('扫描API调用失败:', error)
      throw error
    }
  }
}