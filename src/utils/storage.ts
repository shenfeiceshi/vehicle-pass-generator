import { ApplicationData, LocalStorageData, Statistics, STORAGE_KEYS } from '../types'

/**
 * 本地存储管理工具类
 */
export class StorageManager {
  /**
   * 获取所有申请数据
   */
  static getApplications(): ApplicationData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!data) return []
      
      const parsed: LocalStorageData = JSON.parse(data)
      return parsed.applications || []
    } catch (error) {
      console.error('获取申请数据失败:', error)
      return []
    }
  }

  /**
   * 获取所有图片数据
   */
  static getImages(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!data) return {}
      
      const parsed: LocalStorageData = JSON.parse(data)
      return parsed.images || {}
    } catch (error) {
      console.error('获取图片数据失败:', error)
      return {}
    }
  }

  /**
   * 获取完整的存储数据
   */
  static getAllData(): LocalStorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!data) {
        return { applications: [], images: {} }
      }
      
      const parsed: LocalStorageData = JSON.parse(data)
      return {
        applications: parsed.applications || [],
        images: parsed.images || {}
      }
    } catch (error) {
      console.error('获取存储数据失败:', error)
      return { applications: [], images: {} }
    }
  }

  /**
   * 根据ID获取单个申请数据
   */
  static getApplicationById(id: string): ApplicationData | null {
    try {
      const applications = this.getApplications()
      return applications.find(app => app.id === id) || null
    } catch (error) {
      console.error('获取申请数据失败:', error)
      return null
    }
  }

  /**
   * 根据ID获取图片数据
   */
  static getImageById(id: string): string | null {
    try {
      const images = this.getImages()
      return images[id] || null
    } catch (error) {
      console.error('获取图片数据失败:', error)
      return null
    }
  }

  /**
   * 保存申请数据
   */
  static saveApplication(application: ApplicationData): boolean {
    try {
      const data = this.getAllData()
      
      // 检查是否已存在相同ID的申请
      const existingIndex = data.applications.findIndex(app => app.id === application.id)
      
      if (existingIndex >= 0) {
        // 更新现有申请
        data.applications[existingIndex] = application
      } else {
        // 添加新申请
        data.applications.push(application)
      }
      
      // 按创建时间倒序排列
      data.applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('保存申请数据失败:', error)
      return false
    }
  }

  /**
   * 保存图片数据
   */
  static saveImage(applicationId: string, imageDataUrl: string): boolean {
    try {
      const data = this.getAllData()
      data.images[applicationId] = imageDataUrl
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('保存图片数据失败:', error)
      return false
    }
  }

  /**
   * 删除申请数据（包括对应的图片）
   */
  static deleteApplication(id: string): boolean {
    try {
      const data = this.getAllData()
      
      // 删除申请记录
      data.applications = data.applications.filter(app => app.id !== id)
      
      // 删除对应的图片
      delete data.images[id]
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('删除申请数据失败:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   */
  static clearAllData(): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify({ applications: [], images: {} }))
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  /**
   * 获取统计数据
   */
  static getStatistics(): Statistics {
    try {
      const applications = this.getApplications()
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const todayApplications = applications.filter(app => 
        new Date(app.createdAt) >= today
      ).length

      const thisWeekApplications = applications.filter(app => 
        new Date(app.createdAt) >= thisWeek
      ).length

      const thisMonthApplications = applications.filter(app => 
        new Date(app.createdAt) >= thisMonth
      ).length

      return {
        totalApplications: applications.length,
        todayApplications,
        thisWeekApplications,
        thisMonthApplications,
        mostRecentApplication: applications[0] || undefined
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return {
        totalApplications: 0,
        todayApplications: 0,
        thisWeekApplications: 0,
        thisMonthApplications: 0
      }
    }
  }

  /**
   * 搜索申请记录
   */
  static searchApplications(query: string): ApplicationData[] {
    try {
      const applications = this.getApplications()
      const lowerQuery = query.toLowerCase().trim()
      
      if (!lowerQuery) return applications
      
      return applications.filter(app => 
        app.applicantName.toLowerCase().includes(lowerQuery) ||
        app.department.toLowerCase().includes(lowerQuery) ||
        app.invitee.toLowerCase().includes(lowerQuery) ||
        app.licensePlate.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error('搜索申请记录失败:', error)
      return []
    }
  }

  /**
   * 导出数据为JSON
   */
  static exportData(): string {
    try {
      const data = this.getAllData()
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('导出数据失败:', error)
      return '{}'
    }
  }

  /**
   * 从JSON导入数据
   */
  static importData(jsonData: string): boolean {
    try {
      const data: LocalStorageData = JSON.parse(jsonData)
      
      // 验证数据格式
      if (!data.applications || !Array.isArray(data.applications)) {
        throw new Error('无效的数据格式')
      }
      
      // 验证每个申请记录的必要字段
      for (const app of data.applications) {
        if (!app.id || !app.applicantName || !app.licensePlate || !app.createdAt) {
          throw new Error('申请记录缺少必要字段')
        }
      }
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || ''
      const used = new Blob([data]).size
      const total = 5 * 1024 * 1024 // 假设localStorage限制为5MB
      const percentage = (used / total) * 100
      
      return { used, total, percentage }
    } catch (error) {
      console.error('获取存储使用情况失败:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }

  /**
   * 检查存储是否可用
   */
  static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      console.error('localStorage不可用:', error)
      return false
    }
  }

  /**
   * 清理过期数据（可选功能）
   */
  static cleanupExpiredData(daysToKeep: number = 30): number {
    try {
      const applications = this.getApplications()
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const validApplications = applications.filter(app => 
        new Date(app.createdAt) >= cutoffDate
      )
      
      const removedCount = applications.length - validApplications.length
      
      if (removedCount > 0) {
        const data = this.getAllData()
        data.applications = validApplications
        
        // 清理对应的图片
        const validIds = new Set(validApplications.map(app => app.id))
        const cleanedImages: Record<string, string> = {}
        
        for (const [id, imageData] of Object.entries(data.images)) {
          if (validIds.has(id)) {
            cleanedImages[id] = imageData
          }
        }
        
        data.images = cleanedImages
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data))
      }
      
      return removedCount
    } catch (error) {
      console.error('清理过期数据失败:', error)
      return 0
    }
  }
}

// 导出便捷函数
export const {
  getApplications,
  getImages,
  getAllData,
  getApplicationById,
  getImageById,
  saveApplication,
  saveImage,
  deleteApplication,
  clearAllData,
  getStatistics,
  searchApplications,
  exportData,
  importData,
  getStorageUsage,
  isStorageAvailable,
  cleanupExpiredData
} = StorageManager