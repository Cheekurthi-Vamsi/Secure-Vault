import { motion } from 'framer-motion'
import { Shield, Users, Briefcase, CreditCard, Gamepad2, MoreHorizontal } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Password {
  category: string
}

interface StatsCardsProps {
  passwords: Password[]
}

export function StatsCards({ passwords }: StatsCardsProps) {
  const { isDark } = useTheme()

  const getPasswordCount = () => {
    return {
      total: passwords.length,
      social: passwords.filter(p => p.category === 'social').length,
      work: passwords.filter(p => p.category === 'work').length,
      finance: passwords.filter(p => p.category === 'finance').length,
      entertainment: passwords.filter(p => p.category === 'entertainment').length,
      other: passwords.filter(p => p.category === 'other').length,
    }
  }

  const counts = getPasswordCount()

  const stats = [
    {
      label: 'Total',
      value: counts.total,
      icon: Shield,
      gradient: 'from-pink-400 to-blue-400',
      bgGradient: 'from-pink-200/30 to-blue-200/30',
      darkBgGradient: 'from-pink-500/20 to-blue-500/20'
    },
    {
      label: 'Social',
      value: counts.social,
      icon: Users,
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-200/30 to-cyan-200/30',
      darkBgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      label: 'Work',
      value: counts.work,
      icon: Briefcase,
      gradient: 'from-purple-400 to-pink-400',
      bgGradient: 'from-purple-200/30 to-pink-200/30',
      darkBgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      label: 'Finance',
      value: counts.finance,
      icon: CreditCard,
      gradient: 'from-emerald-400 to-teal-400',
      bgGradient: 'from-emerald-200/30 to-teal-200/30',
      darkBgGradient: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      label: 'Entertainment',
      value: counts.entertainment,
      icon: Gamepad2,
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200/30 to-red-200/30',
      darkBgGradient: 'from-orange-500/20 to-red-500/20'
    },
    {
      label: 'Other',
      value: counts.other,
      icon: MoreHorizontal,
      gradient: 'from-gray-400 to-slate-400',
      bgGradient: 'from-gray-200/30 to-slate-200/30',
      darkBgGradient: 'from-gray-500/20 to-slate-500/20'
    }
  ]

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
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          className={`bg-gradient-to-br ${isDark ? stat.darkBgGradient : stat.bgGradient
            } backdrop-blur-2xl rounded-3xl p-6 border ${isDark ? 'border-gray-600/30' : 'border-pink-200/30'
            } relative overflow-hidden group cursor-pointer`}
          whileHover={{
            scale: 1.05,
            y: -8,
            transition: { type: "spring", stiffness: 300 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated background overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            initial={false}
          />

          {/* Floating particles effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${20 + i * 30}%`,
                  left: `${20 + i * 20}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>

          <div className="relative z-10">
            <motion.div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center mx-auto mb-6 shadow-2xl`}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <stat.icon className="w-8 h-8 text-white" />
            </motion.div>

            <div className="text-center">
              <motion.div
                className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: index * 0.1 + 0.5,
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 400 }
                }}
              >
                <span
                  className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </span>
              </motion.div>

              <motion.div
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
              >
                {stat.label}
              </motion.div>
            </div>
          </div>

          {/* Hover glow effect */}
          <motion.div
            className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl`}
            initial={false}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}