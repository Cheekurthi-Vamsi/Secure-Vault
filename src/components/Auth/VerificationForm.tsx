import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface VerificationFormProps {
  verificationData: {
    userId: string
    verificationType: 'email'
    email?: string
  }
  onSuccess: () => void
  onBack: () => void
}

export function VerificationForm({ verificationData, onSuccess, onBack }: VerificationFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  const { login } = useAuth()
  const { isDark } = useTheme()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verificationData.userId,
          code: verificationCode
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
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verificationData.userId,
          verificationType: 'email'
        }),
      })

      if (response.ok) {
        setTimeLeft(600)
        setCanResend(false)
        setError('')
      }
    } catch (err) {
      setError('Failed to resend code')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
                <Mail className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Verify Your Email
              </h1>
              <p className={`mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We've sent a 6-digit code to your email
              </p>
              <p className="text-pink-500 font-medium">
                {verificationData.email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-4 text-center ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Enter Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {code.map((digit, index) => (
                    <motion.input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700/30 border-gray-600/30 text-gray-200' 
                          : 'bg-white/20 border-pink-200/30 text-gray-700'
                      }`}
                      maxLength={1}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                </div>
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
                disabled={loading || code.join('').length !== 6}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-pink-300/25"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm mb-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Code expires in: <span className="text-pink-500 font-mono">{formatTime(timeLeft)}</span>
              </p>
              
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  className="inline-flex items-center space-x-2 text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Code</span>
                </button>
              ) : (
                <p className={`text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Didn't receive the code? You can resend it when the timer expires.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}