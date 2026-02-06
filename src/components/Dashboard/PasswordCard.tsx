import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Copy, Edit, Trash2, Globe, User, Key, ExternalLink, CheckCircle, Lock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { PinModal } from './PinModal'
import { verifyPin } from '../../lib/encryption'

interface Password {
  id: string
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

interface PasswordCardProps {
  password: Password
  onEdit: (password: Password) => void
  onDelete: (id: string) => void
}

export function PasswordCard({ password, onEdit, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinAction, setPinAction] = useState<'view' | 'copy' | 'edit'>('view')
  const { isDark } = useTheme()

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getWebsiteIcon = (website: string) => {
    try {
      const url = website.startsWith('http') ? website : `https://${website}`
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const handlePasswordAction = (action: 'view' | 'copy' | 'edit') => {
    if (password.pin) {
      setPinAction(action)
      setShowPinModal(true)
    } else {
      executeAction(action)
    }
  }

  const executeAction = (action: 'view' | 'copy' | 'edit') => {
    switch (action) {
      case 'view':
        setShowPassword(!showPassword)
        break
      case 'copy':
        copyToClipboard(password.password, 'password')
        break
      case 'edit':
        onEdit(password)
        break
    }
  }

  const handlePinVerification = async (pin: string) => {
    if (password.pin) {
      const isValid = verifyPin(pin, password.pin)
      if (isValid) {
        setShowPinModal(false)
        executeAction(pinAction)
      } else {
        alert('Incorrect PIN')
      }
    } else {
      setShowPinModal(false)
      executeAction(pinAction)
    }
  }




  const getCategoryIcon = (category: string) => {
    const icons = {
      'social': '👥',
      'work': '💼',
      'finance': '💳',
      'entertainment': '🎮',
      'other': '📁'
    }
    return icons[category as keyof typeof icons] || icons.other
  }

  const websiteIcon = getWebsiteIcon(password.website)

  return (
    <>
      <motion.div
        className={`backdrop-blur-2xl rounded-3xl p-6 border transition-all duration-300 group relative overflow-hidden ${isDark
          ? 'bg-gray-800/30 border-gray-600/30 hover:border-blue-400/50'
          : 'bg-white/30 border-pink-200/30 hover:border-blue-300/50'
          }`}
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {websiteIcon ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300 bg-white/10 flex items-center justify-center">
                    <img
                      src={websiteIcon}
                      alt={`${password.title} icon`}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className={`hidden w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl shadow-2xl`}>
                      {getCategoryIcon(password.category)}
                    </div>
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {getCategoryIcon(password.category)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={`font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>{password.title}</h3>
                  {password.pin && (
                    <Lock className="w-4 h-4 text-pink-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Globe className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{password.website}</p>
                  <button
                    onClick={() => window.open(password.website.startsWith('http') ? password.website : `https://${password.website}`, '_blank')}
                    className={`p-1 rounded-lg transition-all duration-200 ${isDark
                      ? 'hover:bg-gray-600/20 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-md border ${isDark
                    ? 'bg-gray-700/50 border-gray-600/50 text-gray-300'
                    : 'bg-white/50 border-gray-200/50 text-gray-600'
                    }`}>
                    {password.category.charAt(0).toUpperCase() + password.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 self-start">
              <motion.button
                onClick={() => handlePasswordAction('edit')}
                className={`p-2 rounded-xl backdrop-blur-xl transition-all duration-200 ${isDark
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300'
                  : 'bg-blue-200/30 hover:bg-blue-200/50 text-blue-500 hover:text-blue-600'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onDelete(password.id)}
                className={`p-2 rounded-xl backdrop-blur-xl transition-all duration-200 ${isDark
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                  : 'bg-red-200/30 hover:bg-red-200/50 text-red-500 hover:text-red-600'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between rounded-2xl p-4 backdrop-blur-xl ${isDark ? 'bg-gray-700/20' : 'bg-white/20'
              }`}>
              <div className="flex items-center space-x-3">
                <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>{password.username}</span>
              </div>
              <motion.button
                onClick={() => copyToClipboard(password.username, 'username')}
                className={`p-2 rounded-xl transition-all duration-200 ${isDark
                  ? 'hover:bg-gray-600/20 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {copied === 'username' ? (
                  <CheckCircle className="w-4 h-4 text-pink-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
            </div>

            <div className={`flex items-center justify-between rounded-2xl p-4 backdrop-blur-xl ${isDark ? 'bg-gray-700/20' : 'bg-white/20'
              }`}>
              <div className="flex items-center space-x-3">
                <Key className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                  {showPassword ? password.password : '••••••••••••'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => handlePasswordAction('view')}
                  className={`p-2 rounded-xl transition-all duration-200 ${isDark
                    ? 'hover:bg-gray-600/20 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                    }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  onClick={() => handlePasswordAction('copy')}
                  className={`p-2 rounded-xl transition-all duration-200 ${isDark
                    ? 'hover:bg-gray-600/20 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-white/20 text-gray-500 hover:text-gray-700'
                    }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied === 'password' ? (
                    <CheckCircle className="w-4 h-4 text-pink-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {password.notes && (
              <div className={`rounded-2xl p-4 backdrop-blur-xl ${isDark ? 'bg-gray-700/20' : 'bg-white/20'
                }`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{password.notes}</p>
              </div>
            )}
          </div>

        </div>
      </motion.div >

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinVerification}
        title={`Enter PIN to ${pinAction === 'edit' ? 'Edit' : pinAction === 'view' ? 'View' : 'Copy'} Password`}
        isVerification={true}
      />
    </>
  )
}