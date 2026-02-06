import { motion } from 'framer-motion'
import { LogOut, Moon, Sun, Shield, Plus, Sparkles, User } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  onAddPassword: () => void
  onOpenProfile: () => void
}

export function Header({ onAddPassword, onOpenProfile }: HeaderProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.header
      className={`backdrop-blur-2xl border-b relative overflow-hidden ${isDark
        ? 'bg-gray-900/20 border-gray-700/30'
        : 'bg-white/20 border-pink-200/30'
        }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
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
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-24">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r from-pink-400 to-blue-400 shadow-2xl"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(236, 72, 153, 0.3)",
                  "0 0 30px rgba(59, 130, 246, 0.3)",
                  "0 0 20px rgba(236, 72, 153, 0.3)"
                ]
              }}
              style={{
                transition: "box-shadow 3s ease-in-out"
              }}
            >
              <Shield className="w-9 h-9 text-white" />
            </motion.div>
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                SecureVault
              </motion.h1>
              <motion.p
                className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your Digital Security Hub
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              onClick={onAddPassword}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-bold rounded-3xl hover:from-pink-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-pink-300/25 relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 opacity-0 group-hover:opacity-30 blur-xl"
                initial={false}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                animate={{ rotate: [0, 90, 0] }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="group-hover:rotate-90 transition-transform duration-300"
              >
                <Plus className="w-6 h-6 mr-3" />
              </motion.div>

              <span className="relative z-10 text-lg">Add Password</span>

              <motion.div
                className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={toggleTheme}
              className={`p-4 rounded-3xl backdrop-blur-xl border transition-all duration-300 group ${isDark
                ? 'bg-gray-800/30 hover:bg-gray-700/40 border-gray-600/30 text-yellow-400'
                : 'bg-white/20 hover:bg-white/30 border-pink-200/30 text-gray-600'
                }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {isDark ? (
                  <Sun className="w-7 h-7" />
                ) : (
                  <Moon className="w-7 h-7" />
                )}
              </motion.div>
            </motion.button>

            <motion.div
              className={`flex items-center space-x-4 backdrop-blur-xl rounded-3xl px-6 py-3 border group ${isDark
                ? 'bg-gray-800/30 border-gray-600/30'
                : 'bg-white/20 border-pink-200/30'
                }`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.button
                onClick={onOpenProfile}
                className={`flex items-center space-x-4 rounded-2xl p-3 transition-all duration-300 ${isDark
                  ? 'hover:bg-gray-700/30'
                  : 'hover:bg-white/10'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {user?.imageUrl ? (
                    <motion.img
                      src={user.imageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-400/30 shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        scale: 1.1,
                        borderColor: "rgba(236, 72, 153, 0.6)",
                        boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)"
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>

                <div className="text-left">
                  <motion.p
                    className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.primaryEmailAddress?.emailAddress}
                  </motion.p>
                  <motion.p
                    className={`text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full mr-2"
                    />
                    Verified Account
                  </motion.p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => signOut()}
                className={`p-3 rounded-2xl transition-all duration-300 group ${isDark
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                  : 'bg-red-200/30 hover:bg-red-200/50 text-red-500 hover:text-red-600'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <LogOut className="w-6 h-6" />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}