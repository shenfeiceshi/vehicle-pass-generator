// 申请表单数据类型
export interface FormData {
  applicantName: string
  department: string
  invitee: string
  licensePlate: string
}

// 申请记录数据类型
export interface ApplicationData {
  id: string
  applicantName: string
  department: string
  invitee: string
  licensePlate: string
  createdAt: string
  phone?: string
  visitDate?: string
  visitTime?: string
  purpose?: string
}

// 本地存储数据结构
export interface LocalStorageData {
  applications: ApplicationData[]
  images: Record<string, string> // key: applicationId, value: base64 image data
}

// 表单验证错误类型
export interface FormErrors {
  applicantName?: string
  department?: string
  invitee?: string
  licensePlate?: string
}

// 分享数据类型
export interface ShareData {
  applicationId: string
  shareUrl: string
  createdAt: string
}

// 图片生成配置
export interface ImageGenerationConfig {
  width: number
  height: number
  quality: number
  templatePath: string
  fontSize: {
    title: number
    subtitle: number
    content: number
    licensePlate: number
    footer: number
  }
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
    accent: string
  }
  positions: {
    title: { x: number; y: number }
    subtitle: { x: number; y: number }
    applicantName: { x: number; y: number }
    department: { x: number; y: number }
    invitee: { x: number; y: number }
    licensePlate: { x: number; y: number }
    timestamp: { x: number; y: number }
  }
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 统计数据类型
export interface Statistics {
  totalApplications: number
  todayApplications: number
  thisWeekApplications: number
  thisMonthApplications: number
  mostRecentApplication?: ApplicationData
}

// 导出功能类型
export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf'
  quality: number
  includeMetadata: boolean
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  createdAt: string
}

// 应用配置类型
export interface AppConfig {
  version: string
  buildDate: string
  features: {
    enableShare: boolean
    enableHistory: boolean
    enableDownload: boolean
    maxHistoryItems: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: 'zh-CN' | 'en-US'
    showWelcomeMessage: boolean
  }
}

// 常量定义
export const STORAGE_KEYS = {
  APPLICATIONS: 'vehicle_permit_applications',
  CONFIG: 'vehicle_permit_config',
  NOTIFICATIONS: 'vehicle_permit_notifications'
} as const

export const ROUTES = {
  HOME: '/',
  APPLY: '/apply',
  RESULT: '/result',
  HISTORY: '/history',
  SHARE: '/share'
} as const

export const IMAGE_CONFIG: ImageGenerationConfig = {
  width: 800,
  height: 1200,
  quality: 0.9,
  templatePath: '/车辆通行证_画板 1.jpg',
  fontSize: {
    title: 24,
    subtitle: 18,
    content: 16,
    licensePlate: 24,
    footer: 12
  },
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    text: '#1f2937',
    background: '#ffffff',
    accent: '#dc2626'
  },
  positions: {
    title: { x: 187, y: 100 },
    subtitle: { x: 187, y: 140 },
    applicantName: { x: 50, y: 350 },
    department: { x: 50, y: 380 },
    invitee: { x: 50, y: 410 },
    licensePlate: { x: 50, y: 450 },
    timestamp: { x: 50, y: 520 }
  }
}

// 车牌号验证正则表达式
export const LICENSE_PLATE_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/

// 默认配置
export const DEFAULT_CONFIG: AppConfig = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  features: {
    enableShare: true,
    enableHistory: true,
    enableDownload: true,
    maxHistoryItems: 100
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    showWelcomeMessage: true
  }
}