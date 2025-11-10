/**
 * 环境配置管理
 */
export interface AppConfig {
  apiBaseUrl: string
  appTitle: string
  appVersion: string
  appDescription: string
  appAuthor: string
  isDevelopment: boolean
}

/**
 * 获取当前环境的应用配置
 */
export const getAppConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.DEV ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1'

  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl(),
    appTitle: import.meta.env.VITE_APP_TITLE || 'MalModelScan',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    appDescription: import.meta.env.VITE_APP_DESCRIPTION || '专业的机器学习模型安全扫描工具',
    appAuthor: import.meta.env.VITE_APP_AUTHOR || 'MalModelScan Team',
    isDevelopment
  }
}

/**
 * 获取默认 API URL
 */
const getDefaultApiUrl = (): string => {
  const hostname = window.location.hostname

  // GitHub Pages 环境
  if (hostname.endsWith('.github.io')) {
    // 这里需要替换为实际的云服务地址
    return 'https://your-backend-service.onrender.com'
  }

  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5180'
  }

  // 其他环境使用相对路径（如果有同域名部署的 API）
  return `${window.location.origin}/api`
}

/**
 * 全局配置实例
 */
export const appConfig = getAppConfig()

/**
 * 配置验证
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!appConfig.apiBaseUrl) {
    errors.push('API 基础地址未配置')
  }

  if (!appConfig.apiBaseUrl.startsWith('http')) {
    errors.push('API 基础地址格式不正确')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}