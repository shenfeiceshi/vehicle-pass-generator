import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, Clock, FileText, ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { StorageManager } from '../utils/storage'
import { Statistics } from '../types'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState<Statistics>({
    totalApplications: 0,
    todayApplications: 0,
    thisWeekApplications: 0,
    thisMonthApplications: 0
  })

  useEffect(() => {
    // 加载统计数据
    const stats = StorageManager.getStatistics()
    setStatistics(stats)
  }, [])

  const handleStartApplication = () => {
    navigate('/apply')
  }

  const handleViewHistory = () => {
    navigate('/history')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              2025长安菊展
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              车辆通行证自助生成系统
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 系统介绍 */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              便捷、安全、高效
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              告别繁琐的线下申请流程，在线填写信息即可快速生成车辆通行证，
              支持实时预览、一键下载和便捷分享。
            </p>
          </div>

          {/* 功能特色 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">快速生成</h3>
              <p className="text-gray-600 text-sm">
                填写基本信息，30秒内完成通行证生成
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">实时预览</h3>
              <p className="text-gray-600 text-sm">
                边填写边预览，确保信息准确无误
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">本地存储</h3>
              <p className="text-gray-600 text-sm">
                自动保存申请记录，随时查看历史通行证
              </p>
            </div>
          </div>

          {/* 主要操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartApplication}
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Car className="w-5 h-5 mr-2" />
              开始申请通行证
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            {statistics.totalApplications > 0 && (
              <button
                onClick={handleViewHistory}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5 mr-2" />
                查看历史记录
              </button>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        {statistics.totalApplications > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              使用统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {statistics.totalApplications}
                </div>
                <div className="text-sm text-gray-600">总申请数</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {statistics.todayApplications}
                </div>
                <div className="text-sm text-gray-600">今日申请</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statistics.thisWeekApplications}
                </div>
                <div className="text-sm text-gray-600">本周申请</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {statistics.thisMonthApplications}
                </div>
                <div className="text-sm text-gray-600">本月申请</div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">填写信息</h4>
              <p className="text-gray-600 text-sm">
                填写申请人、车牌号、访问日期等基本信息
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">实时预览</h4>
              <p className="text-gray-600 text-sm">
                系统自动生成预览图，确认信息无误
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">生成通行证</h4>
              <p className="text-gray-600 text-sm">
                点击生成按钮，系统自动创建通行证
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">下载使用</h4>
              <p className="text-gray-600 text-sm">
                下载或分享通行证，打印后即可使用
              </p>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">注意事项：</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 请确保填写信息准确无误，生成后无法修改</li>
            <li>• 通行证仅限指定日期和车辆使用</li>
            <li>• 请妥善保管通行证，避免丢失或损坏</li>
            <li>• 如有疑问，请联系相关工作人员</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home