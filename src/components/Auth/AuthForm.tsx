import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowLeft, User, Calendar, Phone, MapPin, Briefcase, Building, FileText, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface AuthFormProps {
  onSuccess: (data: any) => void
  onForgotPassword: () => void
}

export function AuthForm({ onSuccess, onForgotPassword }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    occupation: '',
    company: '',
    bio: '',
    securityQuestion: '',
    securityAnswer: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark } = useTheme()

  const securityQuestions = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What city were you born in?",
    "What is your favorite food?",
    "What was your childhood nickname?"
  ]

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      if (data.token) {
        // Direct login for signup
        localStorage.setItem('token', data.token)
        login(data.user, data.token)
      } else {
        // Security question needed for signin
        onSuccess(data)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          First Name
        </label>
        <div className="relative">
          <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Enter your first name"
            required
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Last Name
        </label>
        <div className="relative">
          <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Enter your last name"
            required
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Email Address
        </label>
        <div className="relative">
          <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Enter your email"
            required
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Password
        </label>
        <div className="relative">
          <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-12 pr-12 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/30 border-gray-600/30 text-gray-200' 
                  : 'bg-white/20 border-pink-200/30 text-gray-700'
              }`}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Phone Number
          </label>
          <div className="relative">
            <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                  : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Street Address
        </label>
        <div className="relative">
          <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Enter your street address"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            City
          </label>
          <input
            type="text"
            value={formData.address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="City"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            State
          </label>
          <input
            type="text"
            value={formData.address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="State"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ZIP Code
          </label>
          <input
            type="text"
            value={formData.address.zipCode}
            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="ZIP"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Country
          </label>
          <input
            type="text"
            value={formData.address.country}
            onChange={(e) => handleInputChange('address.country', e.target.value)}
            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            placeholder="Country"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Occupation
          </label>
          <div className="relative">
            <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                  : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
              }`}
              placeholder="Your occupation"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Company
          </label>
          <div className="relative">
            <Building className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                  : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
              }`}
              placeholder="Your company"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Bio (Optional)
        </label>
        <div className="relative">
          <FileText className={`absolute left-4 top-4 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
            }`}
            rows={3}
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Security Question
        </label>
        <div className="relative">
          <HelpCircle className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <select
            value={formData.securityQuestion}
            onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
            className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700/30 border-gray-600/30 text-gray-200' 
                : 'bg-white/20 border-pink-200/30 text-gray-700'
            }`}
            required
          >
            <option value="">Select a security question</option>
            {securityQuestions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Security Answer
        </label>
        <input
          type="text"
          value={formData.securityAnswer}
          onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
          className={`w-full px-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
            isDark 
              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
              : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
          }`}
          placeholder="Enter your answer"
          required
        />
      </motion.div>
    </div>
  )

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative z-10 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
    }`}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/20' : 'bg-pink-200/30'
        }`} />
        <div className={`absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500/20' : 'bg-blue-200/30'
        }`} />
        <div className={`absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse delay-2000 ${
          isDark ? 'bg-pink-500/20' : 'bg-purple-200/30'
        }`} />
        <div className={`absolute top-1/2 right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse delay-3000 ${
          isDark ? 'bg-cyan-500/20' : 'bg-cyan-200/30'
        }`} />
        <div className={`absolute bottom-1/3 right-10 w-48 h-48 rounded-full blur-3xl animate-pulse delay-4000 ${
          isDark ? 'bg-indigo-500/20' : 'bg-indigo-200/30'
        }`} />
      </div>

      <motion.div
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border relative overflow-hidden ${
          isDark 
            ? 'bg-gray-800/30 border-gray-600/30' 
            : 'bg-white/30 border-pink-200/30'
        }`}>
          {/* Gradient overlay */}
          <div className={`absolute inset-0 pointer-events-none ${
            isDark 
              ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10' 
              : 'bg-gradient-to-br from-pink-200/20 via-transparent to-blue-200/20'
          }`} />
          
          <div className="relative z-10">
            <button
              onClick={() => navigate('/')}
              className={`mb-6 p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-gray-200' 
                  : 'bg-white/20 hover:bg-white/30 text-gray-600 hover:text-gray-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 mb-6 shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                SecureVault
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {isLogin ? 'Welcome back to your vault' : 'Create your secure vault'}
              </p>
              
              {!isLogin && (
                <div className="flex items-center justify-center mt-4 space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step === currentStep
                          ? 'bg-gradient-to-r from-pink-400 to-blue-400 scale-125'
                          : step < currentStep
                          ? 'bg-pink-300'
                          : isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isLogin ? renderStep1() : (
                <>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-100/50 border border-red-300/50 rounded-xl p-4 text-red-600 text-sm backdrop-blur-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex space-x-4">
                {!isLogin && currentStep > 1 && (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className={`flex-1 py-4 backdrop-blur-xl border rounded-xl transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 border-gray-600/30' 
                        : 'bg-white/20 hover:bg-white/30 text-gray-600 border-pink-200/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Previous
                  </motion.button>
                )}

                {!isLogin && currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all duration-200 shadow-2xl hover:shadow-pink-300/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-pink-300/25"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </motion.button>
                )}
              </div>
            </form>

            <motion.div
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setCurrentStep(1)
                    setError('')
                  }}
                  className="ml-2 text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
              
              {isLogin && (
                <button
                  onClick={onForgotPassword}
                  className="text-pink-500 hover:text-pink-600 font-medium transition-colors text-sm"
                >
                  Forgot your password?
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}