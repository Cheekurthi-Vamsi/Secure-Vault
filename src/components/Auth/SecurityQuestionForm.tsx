import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface SecurityQuestionFormProps {
  securityData: {
    userId: string
    securityQuestion: string
    isForgotPassword?: boolean
    newPassword?: string
  }
  onSuccess: () => void
  onBack: () => void
}

export function SecurityQuestionForm({ securityData, onSuccess, onBack }: SecurityQuestionFormProps) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const { isDark } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (securityData.isForgotPassword) {
        // Reset password flow
        const response = await fetch('http://localhost:3001/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: securityData.userId,
            securityAnswer: answer,
            newPassword: securityData.newPassword
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setSuccess(true)
        setTimeout(() => {
          onBack() // Go back to login
        }, 2000)
      } else {
        // Normal login flow
        const response = await fetch('http://localhost:3001/api/auth/verify-security', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: securityData.userId,
            securityAnswer: answer
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        // Store token and user data
        localStorage.setItem('token', data.token)
        login(data.user, data.token)
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative z-10 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
      }`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border ${
            isDark 
              ? 'bg-gray-800/30 border-gray-600/30' 
              : 'bg-white/30 border-pink-200/30'
          }`}>
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 mb-6 shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Password Reset Successfully!
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You can now sign in with your new password.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative z-10 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
    }`}>
      {/* Animated Background */}
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
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border relative overflow-hidden ${
          isDark 
            ? 'bg-gray-800/30 border-gray-600/30' 
            : 'bg-white/30 border-pink-200/30'
        }`}>
          <div className={`absolute inset-0 pointer-events-none ${
            isDark 
              ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10' 
              : 'bg-gradient-to-br from-pink-200/20 via-transparent to-blue-200/20'
          }`} />
          
          <div className="relative z-10">
            <button
              onClick={onBack}
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
                <HelpCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Security Question
              </h1>
              <p className={`mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {securityData.isForgotPassword 
                  ? 'Answer your security question to reset your password'
                  : 'Please answer your security question to continue'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {securityData.securityQuestion}
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={`w-full px-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-400' 
                      : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
                  }`}
                  placeholder="Enter your answer"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-100/50 border border-red-300/50 rounded-xl p-4 text-red-600 text-sm backdrop-blur-xl text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !answer.trim()}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-pink-300/25"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {securityData.isForgotPassword ? 'Resetting Password...' : 'Verifying...'}
                    </span>
                  </div>
                ) : (
                  securityData.isForgotPassword ? 'Reset Password' : 'Verify & Continue'
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}