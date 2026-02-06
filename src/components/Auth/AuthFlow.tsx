import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthForm } from './AuthForm'
import { SecurityQuestionForm } from './SecurityQuestionForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export function AuthFlow() {
  const [step, setStep] = useState<'auth' | 'security' | 'forgot-password'>('auth')
  const [securityData, setSecurityData] = useState<{
    userId: string
    securityQuestion: string
    isForgotPassword?: boolean
  } | null>(null)

  const handleAuthSuccess = (data: any) => {
    if (data.token) {
      // Direct login (signup)
      return
    } else {
      // Need security question (signin)
      setSecurityData(data)
      setStep('security')
    }
  }

  const handleForgotPassword = () => {
    setStep('forgot-password')
  }

  const handleForgotPasswordSuccess = (data: any) => {
    setSecurityData({ ...data, isForgotPassword: true })
    setStep('security')
  }

  const handleSecuritySuccess = () => {
    // This will be handled by the AuthContext
  }

  const handleBackToAuth = () => {
    setStep('auth')
    setSecurityData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <AuthForm 
              onSuccess={handleAuthSuccess} 
              onForgotPassword={handleForgotPassword}
            />
          </motion.div>
        ) : step === 'forgot-password' ? (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <ForgotPasswordForm
              onSuccess={handleForgotPasswordSuccess}
              onBack={handleBackToAuth}
            />
          </motion.div>
        ) : (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <SecurityQuestionForm
              securityData={securityData!}
              onSuccess={handleSecuritySuccess}
              onBack={handleBackToAuth}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}