import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pin: string) => void
  title: string
  isVerification?: boolean
}

export function PinModal({ isOpen, onClose, onSuccess, title, isVerification = false }: PinModalProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const { isDark } = useTheme()

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return
    
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pinValue = pin.join('')
    
    if (pinValue.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    onSuccess(pinValue)
    setPin(['', '', '', ''])
    setError('')
  }

  const handleClose = () => {
    setPin(['', '', '', ''])
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            className={`backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md border relative overflow-hidden ${
              isDark 
                ? 'bg-gray-800/30 border-gray-600/30' 
                : 'bg-white/30 border-pink-200/30'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 ${
              isDark 
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
                    <h2 className={`text-2xl font-bold ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {title}
                    </h2>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {isVerification ? 'Enter your PIN to access' : 'Set a 4-digit PIN for this password'}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    isDark 
                      ? 'hover:bg-gray-700/30 text-gray-400 hover:text-gray-200' 
                      : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-4 text-center ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {isVerification ? 'Enter PIN' : 'Create PIN'}
                  </label>
                  <div className="flex justify-center space-x-4">
                    {pin.map((digit, index) => (
                      <motion.input
                        key={index}
                        id={`pin-${index}`}
                        type="password"
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-16 h-16 text-center text-2xl font-bold backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${
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

                <div className="flex space-x-4 pt-6">
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    className={`flex-1 py-3 px-6 rounded-2xl transition-all duration-200 backdrop-blur-xl border ${
                      isDark 
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
                    disabled={pin.join('').length !== 4}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-blue-500 transition-all duration-200 shadow-2xl hover:shadow-pink-300/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isVerification ? 'Verify' : 'Set PIN'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}