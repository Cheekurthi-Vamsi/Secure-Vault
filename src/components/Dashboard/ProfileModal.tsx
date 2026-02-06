import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, MapPin, Briefcase, Building, Calendar, FileText, Camera, Save, Edit, Lock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../../lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate?: (photo: string) => void
}

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  phoneNumber?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  occupation?: string
  company?: string
  bio?: string
  profilePhoto?: string
}

export function ProfileModal({ isOpen, onClose, onProfileUpdate }: ProfileModalProps) {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    address: {}
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { isDark } = useTheme()

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchProfile()
    }
  }, [isOpen, user?.id])

  const fetchProfile = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      console.log('Fetching profile for:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        console.log('Profile found:', data)
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          dateOfBirth: data.date_of_birth || '',
          phoneNumber: data.phone_number || '',
          address: data.address || {},
          occupation: data.occupation || '',
          company: data.company || '',
          bio: data.bio || '',
          profilePhoto: data.profile_photo || ''
        })
        if (data.profile_photo && onProfileUpdate) {
          onProfileUpdate(data.profile_photo)
        }
      } else {
        // Fallback to Clerk data if no profile exists yet
        setProfile(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          profilePhoto: user.imageUrl || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const dbData = {
        user_id: user.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone_number: profile.phoneNumber,
        date_of_birth: profile.dateOfBirth,
        occupation: profile.occupation,
        company: profile.company,
        address: profile.address,
        bio: profile.bio,
        profile_photo: profile.profilePhoto,
        updated_at: new Date().toISOString()
      }

      console.log('Upserting data:', { ...dbData, profile_photo: dbData.profile_photo ? 'base64...' : null })

      const { data, error } = await supabase
        .from('profiles')
        .upsert(dbData, { onConflict: 'user_id' })
        .select()

      if (error) {
        console.error('Upsert failed:', error)
        throw error
      }

      console.log('Upsert success:', data)

      setIsEditing(false)
      if (profile.profilePhoto && onProfileUpdate) {
        onProfileUpdate(profile.profilePhoto)
      }
      fetchProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error.message || error.details || 'Please try again.'
      if (errorMessage.includes('relation "profiles" does not exist')) {
        alert('Profiles table not found. Please create it in your Supabase SQL editor.')
      } else if (errorMessage.includes('violates row-level security policy')) {
        alert('Security Policy Error: You do not have permission to save this profile. Please ensure you are logged in correctly.')
      } else {
        alert(`Failed to save profile: ${errorMessage}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfile(prev => ({ ...prev, profilePhoto: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            className={`backdrop-blur-2xl rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border relative ${isDark
              ? 'bg-gray-800/30 border-gray-600/30'
              : 'bg-white/30 border-pink-200/30'
              }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 rounded-3xl ${isDark
              ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10'
              : 'bg-gradient-to-br from-pink-200/20 via-transparent to-blue-200/20'
              }`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                      Profile Settings
                    </h2>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Manage your personal information
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className={`p-3 rounded-2xl transition-all duration-200 ${isDark
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                        : 'bg-blue-200/30 hover:bg-blue-200/50 text-blue-500'
                        }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-blue-500 transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: saving ? 1 : 1.05 }}
                      whileTap={{ scale: saving ? 1 : 0.95 }}
                    >
                      {saving ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </div>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
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
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-pink-300/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading profile...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Profile Photo */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {profile.profilePhoto ? (
                          <motion.img
                            src={profile.profilePhoto}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </motion.div>
                      {isEditing && (
                        <motion.label
                          className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full cursor-pointer hover:from-pink-500 hover:to-blue-500 transition-all duration-200 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Camera className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </motion.label>
                      )}
                    </div>
                    {isEditing && (
                      <motion.p
                        className={`text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Click the camera icon to upload a new photo (max 5MB)
                      </motion.p>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        First Name
                      </label>
                      <div className="relative">
                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Last Name
                      </label>
                      <div className="relative">
                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Email
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl opacity-50 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200'
                            : 'bg-white/20 border-pink-200/30 text-gray-700'
                            }`}
                        />
                        <Lock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="tel"
                          value={profile.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="date"
                          value={profile.dateOfBirth || ''}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Occupation
                      </label>
                      <div className="relative">
                        <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="text"
                          value={profile.occupation || ''}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Company
                      </label>
                      <div className="relative">
                        <Building className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <input
                          type="text"
                          value={profile.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                            : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                      Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                          Street Address
                        </label>
                        <div className="relative">
                          <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          <input
                            type="text"
                            value={profile.address?.street || ''}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                              : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            City
                          </label>
                          <input
                            type="text"
                            value={profile.address?.city || ''}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                              : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                              }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            State
                          </label>
                          <input
                            type="text"
                            value={profile.address?.state || ''}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                              : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                              }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={profile.address?.zipCode || ''}
                            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                              : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                              }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Country
                          </label>
                          <input
                            type="text"
                            value={profile.address?.country || ''}
                            onChange={(e) => handleInputChange('address.country', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 ${isDark
                              ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                              : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Bio
                    </label>
                    <div className="relative">
                      <FileText className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full pl-12 pr-4 py-4 backdrop-blur-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none transition-all duration-200 ${isDark
                          ? 'bg-gray-700/30 border-gray-600/30 text-gray-200 disabled:opacity-50'
                          : 'bg-white/20 border-pink-200/30 text-gray-700 disabled:opacity-50'
                          }`}
                        rows={4}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}