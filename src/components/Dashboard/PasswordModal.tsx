import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, RefreshCw, Sparkles, Shield, Lock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { PinModal } from './PinModal'
import { verifyPin } from '../../lib/encryption'

interface Password {
  id?: string
  title: string
  username: string
  password: string
  website: string
  category: string
  notes: string
  pin?: string
  created_at?: string
  updated_at?: string
}

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (password: Password) => void
  password?: Password
}

export function PasswordModal({ isOpen, onClose, onSave, password }: PasswordModalProps) {
  const [formData, setFormData] = useState<Password>({
    title: '',
    username: '',
    password: '',
    website: '',
    category: 'other',
    notes: '',
    pin: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPinModal, setShowPinModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [pinVerified, setPinVerified] = useState(false)
  const [originalPassword, setOriginalPassword] = useState<Password | null>(null)
  const { isDark } = useTheme()

  useEffect(() => {
    if (password) {
      setFormData({ ...password })
      setOriginalPassword(password)
      setIsEditMode(true)
      setPinVerified(false)
      setShowPassword(false)

      // If password has PIN, require verification to edit
      if (password.pin) {
        setShowPinModal(true)
      } else {
        setPinVerified(true)
      }
    } else {
      setFormData({
        title: '',
        username: '',
        password: '',
        website: '',
        category: 'other',
        notes: '',
        pin: ''
      })
      setOriginalPassword(null)
      setIsEditMode(false)
      setPinVerified(true)
      setShowPassword(false)
    }
  }, [password, isOpen])

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }, [formData.password])

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[a-z]/)) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25
    return Math.min(strength, 100)
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'from-red-400 to-red-500'
    if (strength < 50) return 'from-orange-400 to-orange-500'
    if (strength < 75) return 'from-yellow-400 to-yellow-500'
    return 'from-green-400 to-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak'
    if (strength < 50) return 'Fair'
    if (strength < 75) return 'Good'
    return 'Strong'
  }

  const generatePassword = () => {
    const length = 16
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password })
  }

  const handlePinVerification = async (pin: string) => {
    if (isEditMode && originalPassword?.pin) {
      // Verify the entered PIN against the stored encrypted PIN
      const isValid = verifyPin(pin, originalPassword.pin)

      if (isValid) {
        setShowPinModal(false)
        setPinVerified(true)
      } else {
        alert('Incorrect PIN')
      }
    } else {
      // Setting new PIN for new password
      const passwordWithPin = { ...formData, pin }
      onSave(passwordWithPin)
      setShowPinModal(false)
      onClose()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditMode && !pinVerified) {
      alert('Please verify your PIN first')
      return
    }

    if (!isEditMode) {
      // For new passwords, show PIN modal
      setShowPinModal(true)
    } else {
      // For editing existing passwords, save directly (PIN already verified)
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    setPinVerified(false)
    setShowPinModal(false)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              className={`backdrop-blur-2xl rounded-3xl p-6 w-full max-w-lg border relative overflow-hidden ${isDark
                ? 'bg-gray-800/30 border-gray-600/30'
                : 'bg-white/30 border-pink-200/30'
                }`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 ${isDark
                ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10'
                : 'bg-gradient-to-br from-pink-200/20 via-transparent to-blue-200/20'
                }`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        {password ? 'Edit Password' : 'Add New Password'}
                      </h2>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        {isEditMode && !pinVerified ? 'PIN verification required' : 'Secure your digital identity'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleClose}
                    className={`p-3 rounded-2xl transition-all duration-200 ${isDark
                      ? 'hover:bg-gray-700/30 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Show PIN verification message if editing and not verified */}
                {isEditMode && !pinVerified && (
                  <div className={`mb-6 p-4 rounded-2xl backdrop-blur-xl border ${isDark
                    ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200'
                    : 'bg-yellow-200/30 border-yellow-300/30 text-yellow-700'
                    }`}>
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span className="font-medium">PIN verification required to edit this password</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={isEditMode && !pinVerified}
                      className={`w-full px-4 py-3 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                        ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400 disabled:opacity-50'
                        : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500 disabled:opacity-50'
                        }`}
                      placeholder="Enter title"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled={isEditMode && !pinVerified}
                        className={`w-full px-4 py-3 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent appearance-none disabled:opacity-50 ${isDark
                          ? 'bg-gray-700/30 border-gray-600/30 text-gray-200'
                          : 'bg-white/20 border-pink-200/30 text-gray-700'
                          }`}
                      >
                        <option value="social" className={isDark ? 'bg-gray-800' : 'bg-white'}>Social</option>
                        <option value="work" className={isDark ? 'bg-gray-800' : 'bg-white'}>Work</option>
                        <option value="finance" className={isDark ? 'bg-gray-800' : 'bg-white'}>Finance</option>
                        <option value="entertainment" className={isDark ? 'bg-gray-800' : 'bg-white'}>Entertainment</option>
                        <option value="other" className={isDark ? 'bg-gray-800' : 'bg-white'}>Other</option>
                      </select>
                      {/* Custom Arrow Icon */}
                      <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={isEditMode && !pinVerified}
                      className={`w-full px-4 py-3 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                        ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400 disabled:opacity-50'
                        : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500 disabled:opacity-50'
                        }`}
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Username/Email
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={isEditMode && !pinVerified}
                      className={`w-full px-4 py-3 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                        ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400 disabled:opacity-50'
                        : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500 disabled:opacity-50'
                        }`}
                      placeholder="Enter username or email"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pinVerified ? formData.password : '••••••••••••'}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isEditMode && !pinVerified}
                        className={`w-full px-4 py-3 pr-24 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                          ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400 disabled:opacity-50'
                          : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500 disabled:opacity-50'
                          }`}
                        placeholder="Enter password"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <motion.button
                          type="button"
                          onClick={generatePassword}
                          disabled={isEditMode && !pinVerified}
                          className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${isDark
                            ? 'hover:bg-gray-600/30 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                            }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isEditMode && !pinVerified}
                          className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${isDark
                            ? 'hover:bg-gray-600/30 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                            }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && pinVerified && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>Password Strength</span>
                          <span className={`text-sm font-medium bg-gradient-to-r ${getStrengthColor(passwordStrength)} bg-clip-text text-transparent`}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700/30' : 'bg-white/20'
                          }`}>
                          <motion.div
                            className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor(passwordStrength)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      disabled={isEditMode && !pinVerified}
                      className={`w-full px-4 py-3 backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none transition-all duration-200 ${isDark
                        ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400 disabled:opacity-50'
                        : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500 disabled:opacity-50'
                        }`}
                      rows={3}
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <motion.button
                      type="button"
                      onClick={handleClose}
                      className={`flex-1 py-3 px-6 rounded-2xl transition-all duration-200 backdrop-blur-xl border ${isDark
                        ? 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 border-gray-600/30'
                        : 'bg-white/20 hover:bg-white/30 text-gray-600 border-pink-200/30'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isEditMode && !pinVerified}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-blue-500 transition-all duration-200 shadow-2xl hover:shadow-pink-300/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{password ? 'Update' : 'Save'}</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence >

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinVerification}
        title={isEditMode ? "Verify PIN to Edit" : "Set PIN for Password"}
        isVerification={isEditMode}
      />
    </>
  )
}