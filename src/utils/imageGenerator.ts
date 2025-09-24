import { FormData, IMAGE_CONFIG } from '../types'

/**
 * 图片生成工具类
 */
export class ImageGenerator {
  private static instance: ImageGenerator
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
     this.canvas = document.createElement('canvas')
     this.canvas.width = IMAGE_CONFIG.width
     this.canvas.height = IMAGE_CONFIG.height
    
    console.log('创建Canvas元素:', this.canvas)
    console.log('Canvas尺寸设置:', this.canvas.width, 'x', this.canvas.height)
    
    // 检查Canvas是否支持
    this.ctx = this.canvas.getContext('2d')!
    if (!this.ctx) {
      console.error('浏览器不支持Canvas 2D上下文')
      throw new Error('浏览器不支持Canvas 2D上下文')
    }
    
    console.log('Canvas 2D上下文创建成功')
  }

  private static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator()
    }
    return ImageGenerator.instance
  }

  /**
   * 加载底图并创建通行证模板
   */
  private async loadBackgroundImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        console.log('底图加载成功:', img.width, 'x', img.height)
        resolve(img)
      }
      
      img.onerror = (error) => {
        console.error('底图加载失败:', error)
        console.error('尝试的图片路径:', img.src)
        reject(new Error('底图加载失败'))
      }
      
      // 设置底图路径 - 使用public目录中的原始JPG文件
      // 在生产环境中需要添加base路径前缀
      const basePath = import.meta.env.PROD ? '/vehicle-pass-generator/' : '/'
      const imagePath = basePath + '车辆通行证_画板 1.jpg'
      img.src = encodeURI(imagePath)
      console.log('设置图片路径:', img.src)
      console.log('加载public目录中的JPG格式底图文件')
      console.log('当前环境:', import.meta.env.PROD ? '生产环境' : '开发环境')
      console.log('Base路径:', basePath)
      
      // 添加跨域支持
      img.crossOrigin = 'anonymous'
      
      // 设置超时处理
      setTimeout(() => {
        if (!img.complete) {
          console.error('图片加载超时')
          reject(new Error('图片加载超时'))
        }
      }, 10000) // 10秒超时
    })
  }

  /**
   * 创建完整的通行证模板（使用底图）
   */
  private async createPermitTemplate(): Promise<void> {
    const ctx = this.ctx
    const canvas = this.canvas

    console.log('生成2025长安菊展车辆通行证')

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    try {
      // 加载底图
      console.log('开始加载底图...')
      const backgroundImg = await this.loadBackgroundImage()
      
      // 验证图片是否正确加载
      if (!backgroundImg || backgroundImg.width === 0 || backgroundImg.height === 0) {
        throw new Error('底图加载失败：图片数据无效')
      }
      
      console.log('底图加载成功，尺寸:', backgroundImg.width, 'x', backgroundImg.height)
      
      // 绘制底图，保持原始比例和尺寸
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
      console.log('底图绘制完成')
      
      // 验证绘制结果
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasContent = imageData.data.some(pixel => pixel !== 0)
      if (!hasContent) {
        console.warn('警告：Canvas绘制后似乎没有内容')
      }
      
    } catch (error) {
      console.error('底图处理失败:', error)
      console.error('错误详情:', error instanceof Error ? error.message : String(error))
      throw new Error('底图加载失败，无法生成通行证')
    }
  }
  



  /**
   * 绘制文字信息
   */
  private drawTextInfo(ctx: CanvasRenderingContext2D, licensePlate: string, width: number, height: number): void {
    // 在原始JPG底图上叠加车牌号文字
    // 根据原始图片的车牌号区域位置进行调整
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 105px "Microsoft YaHei", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 车牌号显示在图片中间偏上的位置（根据原始设计调整）
    const textX = width / 2
    const textY = height * 0.47  // 调整到合适的垂直位置
    
    // 添加文字阴影效果，确保在底图上清晰可见
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    
    // 绘制车牌号
    ctx.fillText(licensePlate, textX, textY)
    
    // 清除阴影设置，避免影响后续绘制
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  /**
   * 生成通行证图片
   */
  static async generatePermitImage(formData: FormData): Promise<string> {
    const instance = ImageGenerator.getInstance()
    return instance._generatePermitImage(formData)
  }

  private async _generatePermitImage(formData: FormData): Promise<string> {
    try {
      console.log('开始生成通行证图片，表单数据:', formData)
      
      console.log('Canvas尺寸:', this.canvas.width, 'x', this.canvas.height)
      console.log('Canvas上下文:', this.ctx)

      // 清空画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // 使用异步方法创建完整的通行证模板
      await this.createPermitTemplate()

      // 绘制文字信息
      this.drawTextInfo(this.ctx, formData.licensePlate, this.canvas.width, this.canvas.height)

      // 检查Canvas内容
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      const hasContent = imageData.data.some(pixel => pixel !== 0)
      console.log('Canvas是否有内容:', hasContent)
      console.log('Canvas像素数据长度:', imageData.data.length)

      // 转换为DataURL - 使用PNG格式确保兼容性
      const dataUrl = this.canvas.toDataURL('image/png')
      console.log('生成的图片数据URL长度:', dataUrl.length)
      console.log('图片数据URL前缀:', dataUrl.substring(0, 100))
      
      // 验证生成的数据URL
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 1000) {
        console.error('数据URL验证失败')
        throw new Error('生成的图片数据无效')
      }
      
      console.log('图片生成成功')
      return dataUrl
    } catch (error) {
      console.error('生成通行证图片失败:', error)
      throw new Error('生成通行证图片失败，请重试')
    }
  }

  /**
   * 生成预览图片（小尺寸）
   */
  static async generatePreviewImage(formData: FormData): Promise<string> {
    const instance = ImageGenerator.getInstance()
    return instance._generatePreviewImage(formData)
  }

  private async _generatePreviewImage(formData: FormData): Promise<string> {
    try {
      // 先生成完整图片
      const fullImage = await this._generatePermitImage(formData)
      
      // 创建预览Canvas
      const previewCanvas = document.createElement('canvas')
      const previewCtx = previewCanvas.getContext('2d')
      
      if (!previewCtx) {
        throw new Error('预览Canvas初始化失败')
      }

      // 设置预览尺寸（原尺寸的一半）
      previewCanvas.width = IMAGE_CONFIG.width / 2
      previewCanvas.height = IMAGE_CONFIG.height / 2

      // 加载完整图片
      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // 绘制缩放后的图片
          previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height)
          resolve(previewCanvas.toDataURL('image/jpeg', 0.8))
        }
        
        img.onerror = () => {
          reject(new Error('预览图片生成失败'))
        }
        
        img.src = fullImage
      })
    } catch (error) {
      console.error('生成预览图片失败:', error)
      throw new Error('生成预览图片失败')
    }
  }

  /**
   * 下载图片
   */
  static downloadImage(dataUrl: string, filename: string = '车辆通行证.png'): void {
    const instance = ImageGenerator.getInstance()
    instance._downloadImage(dataUrl, filename)
  }

  private _downloadImage(dataUrl: string, filename: string = '车辆通行证.png'): void {
    try {
      console.log('开始下载图片:', filename)
      console.log('数据URL类型:', dataUrl.substring(0, 30))
      
      // 验证数据URL
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        throw new Error('无效的图片数据')
      }
      
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      
      // 设置正确的MIME类型
      link.type = 'image/png'
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('下载触发成功')
    } catch (error) {
      console.error('下载图片失败:', error)
      throw new Error('下载图片失败')
    }
  }

  /**
   * 分享图片（复制到剪贴板）
   */
  static async shareImage(dataUrl: string): Promise<void> {
    const instance = ImageGenerator.getInstance()
    return instance._shareImage(dataUrl)
  }

  private async _shareImage(dataUrl: string): Promise<void> {
    try {
      // 将DataURL转换为Blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // 检查浏览器是否支持剪贴板API
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/jpeg': blob })
        await navigator.clipboard.write([item])
      } else {
        // 备用方案：复制DataURL到剪贴板
        await navigator.clipboard.writeText(dataUrl)
      }
    } catch (error) {
      console.error('分享图片失败:', error)
      throw new Error('分享图片失败，请手动保存图片')
    }
  }

  /**
   * 验证图片数据
   */
  static validateImageData(dataUrl: string): boolean {
    try {
      // 检查是否为有效的DataURL
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return false
      }
      
      // 检查数据长度（避免空图片）
      if (dataUrl.length < 1000) {
        return false
      }
      
      return true
    } catch (error) {
      console.error('验证图片数据失败:', error)
      return false
    }
  }

  /**
   * 获取图片信息
   */
  static getImageInfo(dataUrl: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image()
        
        img.onload = () => {
          // 计算文件大小（估算）
          const base64Data = dataUrl.split(',')[1]
          const size = Math.round((base64Data.length * 3) / 4)
          
          resolve({
            width: img.width,
            height: img.height,
            size
          })
        }
        
        img.onerror = () => {
          reject(new Error('获取图片信息失败'))
        }
        
        img.src = dataUrl
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    ImageGenerator.instance = null as any
  }
}

// 导出便捷函数
export const {
  generatePermitImage,
  generatePreviewImage,
  downloadImage,
  shareImage,
  validateImageData,
  getImageInfo,
  cleanup
} = ImageGenerator