import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Trash2, Search, Calendar, Eye, MoreVertical } from 'lucide-react'
import { ApplicationData } from '../types'
import { StorageManager } from '../utils/storageManager'
import { ImageGenerator } from '../utils/imageGenerator'

const History: React.FC = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    loadHistoryData()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, selectedDate])

  const loadHistoryData = () => {
    try {
      const apps = StorageManager.getApplications()
      setApplications(apps)
    } catch (error) {
      console.error('加载历史数据失败:', error)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDate) {
      filtered = filtered.filter(app => 
        app.visitDate === selectedDate
      )
    }

    setFilteredApplications(filtered)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        StorageManager.deleteApplication(id)
        loadHistoryData()
      } catch (error) {
        console.error('删除记录失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      try {
        StorageManager.clearAll()
        setApplications([])
        setFilteredApplications([])
      } catch (error) {
        console.error('清空记录失败:', error)
        alert('清空失败，请重试')
      }
    }
  }

  const handleDownload = async (app: ApplicationData) => {
    try {
      let imageData = StorageManager.getImage(app.id)
      
      if (!imageData) {
        // 如果图片不存在，重新生成
        // 转换ApplicationData为FormData格式
        const formData = {
          applicantName: app.applicantName,
          department: app.department,
          invitee: app.invitee,
          licensePlate: app.licensePlate
        }
        imageData = await ImageGenerator.generatePermitImage(formData)
        StorageManager.saveImage(app.id, imageData)
      }
      
      await ImageGenerator.downloadImage(
        imageData,
        `车辆通行证_${app.licensePlate}_${app.visitDate}`
      )
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  const handleShare = async (app: ApplicationData) => {
    try {
      let imageData = StorageManager.getImage(app.id)
      
      if (!imageData) {
        // 如果图片不存在，重新生成
        const formData = {
          applicantName: app.applicantName,
          department: app.department,
          invitee: app.invitee,
          licensePlate: app.licensePlate
        }
        imageData = await ImageGenerator.generatePermitImage(formData)
        StorageManager.saveImage(app.id, imageData)
      }
      
      await ImageGenerator.shareImage(imageData)
      alert('图片已复制到剪贴板')
    } catch (error) {
      console.error('分享失败:', error)
      // 备用方案：复制链接
      const shareUrl = `${window.location.origin}/share?id=${app.id}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('分享链接已复制到剪贴板')
      } catch {
        prompt('请复制以下链接进行分享:', shareUrl)
      }
    }
  }

  const handlePreview = async (app: ApplicationData) => {
    setSelectedApp(app)
    setShowPreview(true)
    
    try {
      let imageData = StorageManager.getImage(app.id)
      
      if (!imageData) {
        // 如果图片不存在，重新生成
        // 转换ApplicationData为FormData格式
        const formData = {
          applicantName: app.applicantName,
          department: app.department,
          invitee: app.invitee,
          licensePlate: app.licensePlate
        }
        imageData = await ImageGenerator.generatePermitImage(formData)
        StorageManager.saveImage(app.id, imageData)
      }
      
      setPreviewImage(imageData)
    } catch (error) {
      console.error('加载预览图片失败:', error)
      setPreviewImage(null)
    }
  }

  const closePreview = () => {
    setShowPreview(false)
    setSelectedApp(null)
    setPreviewImage(null)
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
            <h1 className="text-xl font-bold text-gray-800">历史记录</h1>
            <button
              onClick={() => navigate('/apply')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              新建申请
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索申请人、车牌号或部门..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            {applications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                清空记录
              </button>
            )}
          </div>
        </div>

        {/* 历史记录列表 */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {applications.length === 0 ? '暂无历史记录' : '未找到匹配的记录'}
            </h3>
            <p className="text-gray-500 mb-6">
              {applications.length === 0 ? '您还没有申请过车辆通行证' : '请尝试调整搜索条件'}
            </p>
            <button
              onClick={() => navigate('/apply')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              立即申请
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 mr-3">
                        {app.applicantName}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {app.licensePlate}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">部门：</span>
                        {app.department}
                      </div>
                      <div>
                        <span className="font-medium">被邀请人：</span>
                        {app.invitee}
                      </div>
                      <div>
                        <span className="font-medium">访问日期：</span>
                        {app.visitDate}
                      </div>
                      <div>
                        <span className="font-medium">访问时间：</span>
                        {app.visitTime}
                      </div>
                      <div>
                        <span className="font-medium">联系电话：</span>
                        {app.phone}
                      </div>
                      <div>
                        <span className="font-medium">生成时间：</span>
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    {app.purpose && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">访问事由：</span>
                        {app.purpose}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => handlePreview(app)}
                      className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(app)}
                      className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                      title="下载"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(app)}
                      className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-colors"
                      title="分享"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 快速操作按钮 */}
        {filteredApplications.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/apply')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              新建申请
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              返回首页
            </button>
          </div>
        )}
      </div>

      {/* 预览模态框 */}
      {showPreview && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">通行证预览</h3>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* 通行证图片 */}
                <div className="text-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="车辆通行证" 
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">正在加载图片...</p>
                    </div>
                  )}
                </div>
                
                {/* 申请信息 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">申请人：</span>
                      <span>{selectedApp.applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">部门：</span>
                      <span>{selectedApp.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">联系电话：</span>
                      <span>{selectedApp.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">被邀请人：</span>
                      <span>{selectedApp.invitee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">车牌号：</span>
                      <span className="font-bold text-blue-600">{selectedApp.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">访问日期：</span>
                      <span>{selectedApp.visitDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">访问时间：</span>
                      <span>{selectedApp.visitTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">生成时间：</span>
                      <span>{new Date(selectedApp.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                  
                  {selectedApp.purpose && (
                    <div className="pt-4 border-t">
                      <span className="font-medium text-gray-600 block mb-2">访问事由：</span>
                      <p className="text-gray-800">{selectedApp.purpose}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t flex gap-3">
                    <button
                      onClick={() => {
                        handleDownload(selectedApp)
                        closePreview()
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      下载通行证
                    </button>
                    <button
                      onClick={() => {
                        handleShare(selectedApp)
                        closePreview()
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      分享通行证
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History