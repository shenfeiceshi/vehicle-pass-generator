import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Calendar, User, Phone, Building, Car, Clock, FileText } from 'lucide-react'
import { ApplicationData } from '../types'
import { StorageManager } from '../utils/storage'
import { ImageGenerator } from '../utils/imageGenerator'

const Share: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      loadSharedData(id)
    } else {
      setError('无效的分享链接')
      setLoading(false)
    }
  }, [searchParams])

  const loadSharedData = async (id: string) => {
    try {
      const application = StorageManager.getApplicationById(id)
      
      if (application) {
        setApplicationData(application)
        
        // 尝试获取图片，如果不存在则重新生成
        let image = StorageManager.getImageById(id)
        if (!image) {
          try {
            image = await ImageGenerator.generatePermitImage(application)
            StorageManager.saveImage(id, image)
          } catch (error) {
            console.error('生成图片失败:', error)
          }
        }
        setImageData(image || null)
      } else {
        setError('未找到相关申请记录')
      }
    } catch (error) {
      console.error('加载分享数据失败:', error)
      setError('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (imageData && applicationData) {
      try {
        await ImageGenerator.downloadImage(
          imageData,
          `车辆通行证_${applicationData.licensePlate}_${applicationData.visitDate}`
        )
      } catch (error) {
        console.error('下载失败:', error)
        alert('下载失败，请重试')
      }
    }
  }

  const handleShare = async () => {
    if (applicationData && imageData) {
      try {
        await ImageGenerator.shareImage(imageData)
        alert('图片已复制到剪贴板')
      } catch (error) {
        console.error('分享失败:', error)
        // 备用方案：复制链接
        const shareUrl = window.location.href
        try {
          await navigator.clipboard.writeText(shareUrl)
          alert('分享链接已复制到剪贴板')
        } catch {
          prompt('请复制以下链接进行分享:', shareUrl)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!applicationData) {
    return null
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
            <h1 className="text-xl font-bold text-gray-800">车辆通行证</h1>
            <button
              onClick={() => navigate('/apply')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              申请通行证
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 分享提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <Share2 className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-800">分享的车辆通行证</h3>
              <p className="text-blue-600 text-sm">此通行证由 {applicationData.applicantName} 生成并分享</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 通行证展示 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">2025长安菊展车辆通行证</h2>
            
            {imageData ? (
              <div className="text-center mb-6">
                <img 
                  src={imageData} 
                  alt="车辆通行证" 
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">通行证图片不可用</p>
              </div>
            )}

            <div className="flex gap-4">
              {imageData && (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  下载通行证
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                再次分享
              </button>
            </div>
          </div>

          {/* 申请信息详情 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">申请信息</h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">申请人</p>
                  <p className="font-semibold text-gray-800">{applicationData.applicantName}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Building className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">所属部门</p>
                  <p className="font-semibold text-gray-800">{applicationData.department}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">联系电话</p>
                  <p className="font-semibold text-gray-800">{applicationData.phone}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">被邀请人</p>
                  <p className="font-semibold text-gray-800">{applicationData.invitee}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Car className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600">车牌号码</p>
                  <p className="font-bold text-blue-800 text-lg">{applicationData.licensePlate}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">访问日期</p>
                  <p className="font-semibold text-gray-800">{applicationData.visitDate}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">访问时间</p>
                  <p className="font-semibold text-gray-800">{applicationData.visitTime}</p>
                </div>
              </div>

              {applicationData.purpose && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">访问事由</p>
                      <p className="text-gray-800">{applicationData.purpose}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-orange-600">生成时间</p>
                  <p className="font-semibold text-orange-800">
                    {new Date(applicationData.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">温馨提示</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 请在指定日期和时间内使用此通行证</p>
            <p>• 进入园区时请主动出示此通行证</p>
            <p>• 如有疑问，请联系相关工作人员</p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/apply')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              申请新的通行证
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Share