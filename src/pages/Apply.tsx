import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Building, Users, Car } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { StorageManager } from '../utils/storage'

interface FormData {
  applicantName: string
  department: string
  invitee: string
  licensePlate: string
}

const Apply = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    department: '',
    invitee: '',
    licensePlate: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}
    
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = '请输入申请人姓名'
    }
    
    if (!formData.department.trim()) {
      newErrors.department = '请输入申请部门'
    }
    
    if (!formData.invitee.trim()) {
      newErrors.invitee = '请输入邀请人员'
    }
    
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = '请输入车牌号'
    } else if (!/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/.test(formData.licensePlate)) {
      newErrors.licensePlate = '请输入正确的车牌号格式'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const applicationId = uuidv4()
      const applicationData = {
        id: applicationId,
        ...formData,
        createdAt: new Date().toISOString()
      }
      
      // 使用StorageManager保存数据
      StorageManager.saveApplication(applicationData)
      
      // 跳转到结果页面
      navigate(`/result/${applicationId}`)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部导航 */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧表单 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              2025长安菊展车辆通行证申请
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 申请人姓名 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-orange-500" />
                  申请人姓名 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.applicantName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入申请人姓名"
                />
                {errors.applicantName && (
                  <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>
                )}
              </div>

              {/* 申请部门 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 mr-2 text-orange-500" />
                  申请部门 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入申请部门"
                />
                {errors.department && (
                  <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                )}
              </div>



              {/* 邀请人员 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />
                  邀请人员 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.invitee}
                  onChange={(e) => handleInputChange('invitee', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.invitee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入邀请人员"
                />
                {errors.invitee && (
                  <p className="text-red-500 text-sm mt-1">{errors.invitee}</p>
                )}
              </div>

              {/* 车牌号 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4 mr-2 text-orange-500" />
                  车牌号 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="如：浙F12345"
                  maxLength={7}
                />
                {errors.licensePlate && (
                  <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>
                )}
              </div>



              {/* 提交按钮 */}
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                生成通行证
              </button>
            </form>
          </div>

          {/* 右侧预览 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              通行证预览
            </h2>
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-6 text-white">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">2025长安菊展</h3>
                <h2 className="text-2xl font-bold mt-2">车辆通行证</h2>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>申请人：</span>
                  <span className="font-medium">{formData.applicantName || '___'}</span>
                </div>
                <div className="flex justify-between">
                  <span>部门：</span>
                  <span className="font-medium">{formData.department || '___'}</span>
                </div>
                <div className="flex justify-between">
                  <span>邀请人：</span>
                  <span className="font-medium">{formData.invitee || '___'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>车牌号：</span>
                  <span className="font-bold text-2xl">{formData.licensePlate || '浙F12345'}</span>
                </div>
              </div>
              
              <div className="text-center mt-4 text-sm opacity-90">
                请妥善保管此通行证
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Apply