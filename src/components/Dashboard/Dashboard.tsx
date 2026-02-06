import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Shield, Sparkles } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../../contexts/ThemeContext'
import { PasswordCard } from './PasswordCard'
import { PasswordModal } from './PasswordModal'
import { StatsCards } from './StatsCards'
import { ProfileModal } from './ProfileModal'
import { PinModal } from './PinModal'
import { DashboardNavbar } from './DashboardNavbar'
import { supabase } from '../../lib/supabase'
import { encryptPassword, decryptPassword, encryptPin, verifyPin } from '../../lib/encryption'

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

export function Dashboard() {
  const { user } = useUser()
  const { isDark } = useTheme()
  const [passwords, setPasswords] = useState<Password[]>([])
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | undefined>()
  const [loading, setLoading] = useState(true)
  const [deletingPasswordId, setDeletingPasswordId] = useState<string | null>(null)
  const [showDeletePinModal, setShowDeletePinModal] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  const fetchProfilePhoto = async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('profiles')
        .select('profile_photo')
        .eq('user_id', user.id)
        .single()

      if (data?.profile_photo) {
        setProfilePhoto(data.profile_photo)
      } else {
        setProfilePhoto(user.imageUrl || null)
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  useEffect(() => {
    fetchPasswords()
    fetchProfilePhoto()
  }, [user?.id])

  useEffect(() => {
    filterPasswords()
  }, [passwords, searchTerm, selectedCategory])

  const fetchPasswords = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map Supabase data and decrypt passwords
      const mappedPasswords = (data || []).map(p => {
        try {
          return {
            id: p.id,
            title: p.title,
            username: p.username,
            password: decryptPassword(p.password), // Decrypt password
            website: p.website,
            category: p.category,
            notes: p.notes,
            pin: p.pin, // Keep PIN as is (it's encrypted if it exists)
            created_at: p.created_at,
            updated_at: p.updated_at
          }
        } catch (decryptError) {
          console.error('Error decrypting password for item:', p.id, decryptError)
          // Handle legacy unencrypted passwords or failed decryption gracefully
          return {
            id: p.id,
            title: p.title,
            username: p.username,
            password: p.password, // Return raw password as fallback
            website: p.website,
            category: p.category,
            notes: p.notes,
            pin: p.pin,
            created_at: p.created_at,
            updated_at: p.updated_at
          }
        }
      })

      setPasswords(mappedPasswords)
    } catch (error) {
      console.error('Error fetching passwords:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPasswords = () => {
    let filtered = passwords

    if (searchTerm) {
      filtered = filtered.filter(
        (password) =>
          password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
          password.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((password) => password.category === selectedCategory)
    }

    setFilteredPasswords(filtered)
  }

  const handleSavePassword = async (passwordData: Omit<Password, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user?.id) {
        console.error('No user ID found')
        alert('Please log in to save passwords')
        return
      }

      console.log('Saving password for user:', user.id)

      // Encrypt password and PIN before saving
      const dbData = {
        user_id: user.id,
        title: passwordData.title,
        username: passwordData.username,
        password: encryptPassword(passwordData.password),
        website: passwordData.website,
        category: passwordData.category,
        notes: passwordData.notes,
        pin: passwordData.pin ? encryptPin(passwordData.pin) : null,
        is_active: true,
        access_count: 0
      }

      console.log('Data to save:', { ...dbData, password: '***' })

      if (editingPassword) {
        // Update existing password
        console.log('Updating password:', editingPassword.id)
        const { error } = await supabase
          .from('passwords')
          .update(dbData)
          .eq('id', editingPassword.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }
        console.log('Password updated successfully')
      } else {
        // Insert new password
        console.log('Inserting new password')
        const { error, data } = await supabase
          .from('passwords')
          .insert([dbData])
          .select()

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        console.log('Password inserted successfully:', data)
      }

      fetchPasswords()
      setEditingPassword(undefined)
    } catch (error: any) {
      console.error('Error saving password:', error)

      // Provide more specific error messages
      if (error.message?.includes('relation "passwords" does not exist')) {
        alert('Database table not found. Please run the SQL script from README.md in your Supabase SQL Editor.')
      } else if (error.message?.includes('JWT')) {
        alert('Authentication error. Please check your Supabase configuration.')
      } else if (error.message?.includes('violates row-level security policy')) {
        alert('Permission denied. Please check your Row Level Security policies in Supabase.')
      } else {
        alert(`Failed to save password: ${error.message || 'Please try again.'}`)
      }
    }
  }

  const handleDeletePassword = async (id: string) => {
    const passwordToDelete = passwords.find(p => p.id === id)
    if (!passwordToDelete) return

    if (passwordToDelete.pin) {
      setDeletingPasswordId(id)
      setShowDeletePinModal(true)
    } else {
      if (window.confirm('Are you sure you want to delete this password?')) {
        await executeDelete(id)
      }
    }
  }

  const handleVerifyDeletePin = async (pin: string) => {
    if (!deletingPasswordId) return

    const passwordToDelete = passwords.find(p => p.id === deletingPasswordId)
    if (!passwordToDelete || !passwordToDelete.pin) {
      setShowDeletePinModal(false)
      setDeletingPasswordId(null)
      return
    }

    const isValid = verifyPin(pin, passwordToDelete.pin)

    if (isValid) {
      setShowDeletePinModal(false)
      await executeDelete(deletingPasswordId)
      setDeletingPasswordId(null)
    } else {
      alert('Incorrect PIN')
    }
  }

  const executeDelete = async (id: string) => {
    try {
      if (!user?.id) return

      // Hard delete from database
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      console.log('Password deleted successfully')
      fetchPasswords()
    } catch (error) {
      console.error('Error deleting password:', error)
      alert('Failed to delete password. Please try again.')
    }
  }

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password)
    setIsModalOpen(true)
  }

  const handleAddPassword = () => {
    setEditingPassword(undefined)
    setIsModalOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatingAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDark
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
        : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
        }`}>
        {/* Animated background for loading */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-32 h-32 rounded-full blur-3xl ${isDark ? 'bg-blue-500/20' : 'bg-pink-200/30'
                }`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <motion.div
            className="w-20 h-20 border-4 border-pink-300/30 border-t-pink-500 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Loading your secure vault...
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Decrypting your passwords securely
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
      : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
      }`}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Primary floating orbs */}
        <motion.div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-blue-500/15' : 'bg-pink-200/30'
            }`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-purple-500/15' : 'bg-blue-200/30'
            }`}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className={`absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl ${isDark ? 'bg-pink-500/15' : 'bg-purple-200/30'
            }`}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Secondary floating elements */}
        <motion.div
          className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-200/20'
            }`}
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 right-10 w-56 h-56 rounded-full blur-3xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-200/20'
            }`}
          animate={{
            x: [0, 20, 0],
            y: [0, -25, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
        />
        <motion.div
          className={`absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-rose-500/10' : 'bg-rose-200/20'
            }`}
          animate={{
            x: [0, 45, 0],
            y: [0, -15, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="mb-24">
          <DashboardNavbar
            onAddPassword={handleAddPassword}
            onProfileClick={() => setIsProfileModalOpen(true)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            profilePhoto={profilePhoto}
          />
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Section */}
            <motion.div
              variants={itemVariants}
              className="mb-8"
            >
              <div className={`backdrop-blur-2xl rounded-3xl p-6 border relative overflow-hidden group ${isDark
                ? 'bg-gray-800/30 border-gray-600/30'
                : 'bg-white/20 border-pink-200/30'
                }`}>
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 ${isDark
                    ? 'bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10'
                    : 'bg-gradient-to-r from-pink-200/20 via-transparent to-blue-200/20'
                    }`}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Sparkles className="w-12 h-12 text-pink-500" />
                    </div>
                    <div>
                      <motion.h1
                        className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Welcome back, {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0]}!
                      </motion.h1>
                      <motion.p
                        className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        Your digital vault is secure and ready. Manage your passwords with confidence.
                      </motion.p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <motion.div
                    className="hidden lg:flex items-center space-x-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="text-center">
                      <div
                        className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent"
                      >
                        {passwords.length}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Passwords
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
                      >
                        100%
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Secure
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants}>
              <StatsCards passwords={passwords} />
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col lg:flex-row gap-4 mb-8"
            >
              <div className="flex-1 relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-blue-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <Search className={`absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 z-10 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <motion.input
                  type="text"
                  placeholder="Search your vault..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-16 pr-6 py-5 backdrop-blur-2xl border rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 text-lg relative z-10 ${isDark
                    ? 'bg-gray-800/30 border-gray-600/30 text-gray-200 placeholder-gray-400'
                    : 'bg-white/20 border-pink-200/30 text-gray-700 placeholder-gray-500'
                    }`}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>

              <div className="relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <Filter className={`absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 z-10 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <motion.select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`pl-16 pr-12 py-5 backdrop-blur-2xl border rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent appearance-none min-w-[250px] text-lg relative z-10 ${isDark
                    ? 'bg-gray-800/30 border-gray-600/30 text-gray-200'
                    : 'bg-white/20 border-pink-200/30 text-gray-700'
                    }`}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="all">All Categories</option>
                  <option value="social">Social</option>
                  <option value="work">Work</option>
                  <option value="finance">Finance</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </motion.select>
              </div>
            </motion.div>

            {/* Password Grid */}
            <AnimatePresence mode="wait">
              {filteredPasswords.length === 0 ? (
                <motion.div
                  key="empty-state"
                  className="text-center py-24"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`backdrop-blur-2xl rounded-3xl p-16 border max-w-3xl mx-auto relative overflow-hidden ${isDark
                    ? 'bg-gray-800/30 border-gray-600/30'
                    : 'bg-white/20 border-pink-200/30'
                    }`}>
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-blue-500/10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        animate={floatingAnimation}
                        className="mb-8"
                      >
                        <Shield className="w-24 h-24 text-pink-500 mx-auto" />
                      </motion.div>

                      <motion.h3
                        className={`text-3xl font-bold mb-6 ${isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {passwords.length === 0 ? 'Your vault awaits' : 'No matches found'}
                      </motion.h3>

                      <motion.p
                        className={`mb-10 text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        {passwords.length === 0
                          ? 'Start securing your digital life by adding your first password to the vault.'
                          : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                        }
                      </motion.p>

                      {passwords.length === 0 && (
                        <motion.button
                          onClick={handleAddPassword}
                          className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-bold rounded-3xl hover:from-pink-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-pink-300/25 text-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Sparkles className="w-6 h-6 mr-3" />
                          Add Your First Password
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-grid"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredPasswords.map((password, index) => (
                    <motion.div
                      key={password.id}
                      variants={itemVariants}
                      custom={index}
                      layout
                    >
                      <PasswordCard
                        password={password}
                        onEdit={handleEditPassword}
                        onDelete={handleDeletePassword}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <PasswordModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPassword(undefined)
          }}
          onSave={handleSavePassword}
          password={editingPassword}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdate={(photo) => setProfilePhoto(photo)}
        />

        <PinModal
          isOpen={showDeletePinModal}
          onClose={() => {
            setShowDeletePinModal(false)
            setDeletingPasswordId(null)
          }}
          onSuccess={handleVerifyDeletePin}
          title="Enter PIN to Delete"
          isVerification={true}
        />
      </div>
    </div>
  )
}