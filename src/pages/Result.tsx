import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Home, History, CheckCircle, AlertCircle } from 'lucide-react'
import { ApplicationData } from '../types'
import { StorageManager } from '../utils/storage'
import { ImageGenerator } from '../utils/imageGenerator'

const Result: React.FC = () => {
  const navigate = useNavigate()
  const { id: applicationId } = useParams<{ id: string }>()
  
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [permitImage, setPermitImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!applicationId) {
      setError('未找到申请ID')
      setIsLoading(false)
      return
    }

    loadApplicationData()
  }, [applicationId])

  const loadApplicationData = async () => {
    try {
      // 从存储管理器获取数据
      const application = StorageManager.getApplicationById(applicationId!)
      
      if (!application) {
        throw new Error('未找到对应的申请记录')
      }

      setApplicationData(application)

      // 尝试获取已生成的图片
      const existingImage = StorageManager.getImageById(applicationId!)
      if (existingImage) {
        setPermitImage(existingImage)
      } else {
        // 如果没有图片，重新生成
        await generatePermitImage(application)
      }
    } catch (err) {
      console.error('加载申请数据失败:', err)
      setError(err instanceof Error ? err.message : '加载数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePermitImage = async (data: ApplicationData) => {
    try {
      // 转换ApplicationData为FormData格式
      const formData = {
        applicantName: data.applicantName,
        department: data.department,
        invitee: data.invitee,
        licensePlate: data.licensePlate
      }
      
      const imageDataUrl = await ImageGenerator.generatePermitImage(formData)
      setPermitImage(imageDataUrl)
      
      // 保存图片到存储
      StorageManager.saveImage(applicationId!, imageDataUrl)
      
    } catch (err) {
      console.error('生成通行证图片失败:', err)
      setError('生成通行证图片失败')
    }
  }

  const handleDownload = async () => {
    if (!permitImage || !applicationData) return

    try {
      // 确保文件名包含正确的扩展名
      const filename = `车辆通行证_${applicationData.licensePlate}_${new Date(applicationData.createdAt).toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
      
      console.log('开始下载图片:', filename)
      console.log('图片数据URL长度:', permitImage.length)
      console.log('图片数据URL前缀:', permitImage.substring(0, 50))
      
      ImageGenerator.downloadImage(permitImage, filename)
    } catch (err) {
      console.error('下载失败:', err)
      alert('下载失败，请重试')
    }
  }

  const handleShare = async () => {
    if (!permitImage || !applicationData) return

    try {
      console.log('开始分享图片')
      await ImageGenerator.shareImage(permitImage)
      alert('图片已复制到剪贴板')
    } catch (err) {
      console.error('分享失败:', err)
      // 备用方案：复制链接到剪贴板
      try {
        const fallbackUrl = `${window.location.origin}/result/${applicationData.id}`
        await navigator.clipboard.writeText(fallbackUrl)
        alert('分享链接已复制到剪贴板')
      } catch (clipboardErr) {
        console.error('复制到剪贴板失败:', clipboardErr)
        alert('分享失败，请手动保存图片')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成通行证...</p>
        </div>
      </div>
    )
  }

  if (error || !applicationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">生成失败</h2>
            <p className="text-gray-600 mb-6">{error || '未知错误'}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/apply')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                重新申请
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </button>
            <h1 className="text-xl font-bold text-gray-800">通行证生成成功</h1>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
            >
              <History className="w-5 h-5 mr-1" />
              历史记录
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 成功提示 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-green-800 font-semibold">通行证生成成功！</h3>
              <p className="text-green-700 text-sm">您可以下载保存或分享给他人</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 通行证展示 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">车辆通行证</h3>
            {permitImage ? (
              <div className="text-center">
                <img 
                  src={permitImage} 
                  alt="车辆通行证" 
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto mb-4"
                  onError={(e) => {
                    console.error('图片显示失败:', e)
                    console.log('图片数据URL:', permitImage?.substring(0, 100))
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    下载图片
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    分享
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-500">正在生成图片...</p>
              </div>
            )}
          </div>

          {/* 申请信息 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">申请信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">申请人：</span>
                <span className="font-medium">{applicationData.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">部门：</span>
                <span className="font-medium">{applicationData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">被邀请人：</span>
                <span className="font-medium">{applicationData.invitee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">车牌号：</span>
                <span className="font-medium text-blue-600">{applicationData.licensePlate}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">生成时间：</span>
                  <span className="text-sm text-gray-500">
                    {new Date(applicationData.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/apply')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            再次申请
          </button>
          <button
            onClick={() => navigate('/history')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            查看历史记录
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default Result