import { ApplicationData, LocalStorageData, STORAGE_KEYS } from '../types'

/**
 * 本地存储管理器
 */
export class StorageManager {
  /**
   * 获取所有申请记录
   */
  static getApplications(): ApplicationData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!data) return []
      
      const storageData: LocalStorageData = JSON.parse(data)
      return storageData.applications || []
    } catch (error) {
      console.error('获取申请记录失败:', error)
      return []
    }
  }

  /**
   * 保存申请记录
   */
  static saveApplication(application: ApplicationData): void {
    try {
      const applications = this.getApplications()
      
      // 检查是否已存在相同ID的记录
      const existingIndex = applications.findIndex(app => app.id === application.id)
      
      if (existingIndex >= 0) {
        // 更新现有记录
        applications[existingIndex] = application
      } else {
        // 添加新记录
        applications.push(application)
      }
      
      const storageData: LocalStorageData = {
        applications,
        images: this.getImages()
      }
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(storageData))
    } catch (error) {
      console.error('保存申请记录失败:', error)
      throw new Error('保存申请记录失败')
    }
  }

  /**
   * 根据ID获取申请记录
   */
  static getApplication(id: string): ApplicationData | null {
    try {
      const applications = this.getApplications()
      return applications.find(app => app.id === id) || null
    } catch (error) {
      console.error('获取申请记录失败:', error)
      return null
    }
  }

  /**
   * 删除申请记录
   */
  static deleteApplication(id: string): void {
    try {
      const applications = this.getApplications()
      const filteredApplications = applications.filter(app => app.id !== id)
      
      const storageData: LocalStorageData = {
        applications: filteredApplications,
        images: this.getImages()
      }
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(storageData))
      
      // 同时删除对应的图片
      this.deleteImage(id)
    } catch (error) {
      console.error('删除申请记录失败:', error)
      throw new Error('删除申请记录失败')
    }
  }

  /**
   * 获取所有图片数据
   */
  static getImages(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!data) return {}
      
      const storageData: LocalStorageData = JSON.parse(data)
      return storageData.images || {}
    } catch (error) {
      console.error('获取图片数据失败:', error)
      return {}
    }
  }

  /**
   * 保存图片数据
   */
  static saveImage(applicationId: string, imageDataUrl: string): void {
    try {
      const images = this.getImages()
      images[applicationId] = imageDataUrl
      
      const storageData: LocalStorageData = {
        applications: this.getApplications(),
        images
      }
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(storageData))
    } catch (error) {
      console.error('保存图片数据失败:', error)
      throw new Error('保存图片数据失败')
    }
  }

  /**
   * 获取图片数据
   */
  static getImage(applicationId: string): string | null {
    try {
      const images = this.getImages()
      return images[applicationId] || null
    } catch (error) {
      console.error('获取图片数据失败:', error)
      return null
    }
  }

  /**
   * 删除图片数据
   */
  static deleteImage(applicationId: string): void {
    try {
      const images = this.getImages()
      delete images[applicationId]
      
      const storageData: LocalStorageData = {
        applications: this.getApplications(),
        images
      }
      
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(storageData))
    } catch (error) {
      console.error('删除图片数据失败:', error)
      throw new Error('删除图片数据失败')
    }
  }

  /**
   * 清空所有数据
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.APPLICATIONS)
    } catch (error) {
      console.error('清空数据失败:', error)
      throw new Error('清空数据失败')
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0
      const total = 5 * 1024 * 1024 // 5MB (大概的localStorage限制)
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length
        }
      }
      
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100)
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }
}

// 导出便捷函数
export const {
  getApplications,
  saveApplication,
  getApplication,
  deleteApplication,
  getImages,
  saveImage,
  getImage,
  deleteImage,
  clearAll,
  getStorageInfo
} = StorageManager