import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Smartphone, Globe, Zap, ArrowRight, Star, CheckCircle, Sparkles, Users, TrendingUp, Sun, Moon } from 'lucide-react'
import { SignInButton } from '@clerk/clerk-react'
import { useTheme } from '../../contexts/ThemeContext'
import { FloatingNavbar } from '../Shared/FloatingNavbar'

export function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "Your passwords are protected with AES-256 encryption, the same standard used by governments worldwide.",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: Smartphone,
      title: "PIN Protection",
      description: "Each password is protected with a unique 4-digit PIN for an extra layer of security.",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Eye,
      title: "Zero-Knowledge Architecture",
      description: "We can't see your passwords even if we wanted to. Your data is encrypted before it leaves your device.",
      color: "from-emerald-400 to-teal-400"
    },
    {
      icon: Globe,
      title: "Cross-Platform Sync",
      description: "Access your passwords securely across all your devices with real-time synchronization.",
      color: "from-orange-400 to-red-400"
    },
    {
      icon: Zap,
      title: "Instant Password Generation",
      description: "Generate strong, unique passwords instantly with our advanced algorithm.",
      color: "from-yellow-400 to-orange-400"
    },
    {
      icon: Lock,
      title: "Secure Sharing",
      description: "Share passwords safely with team members using encrypted channels.",
      color: "from-indigo-400 to-purple-400"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Security Engineer",
      content: "SecureVault has revolutionized how our team manages passwords. The security features are unmatched.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Marcus Rodriguez",
      role: "Startup Founder",
      content: "Finally, a password manager that doesn't compromise on security or user experience.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Emily Watson",
      role: "Digital Nomad",
      content: "I travel constantly and need secure access everywhere. SecureVault delivers perfectly.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "99.9%", label: "Uptime", icon: TrendingUp },
    { number: "256-bit", label: "Encryption", icon: Shield },
    { number: "24/7", label: "Support", icon: Sparkles }
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
    hidden: { opacity: 0, y: 30 },
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
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
      : 'bg-gradient-to-br from-pink-50 via-blue-50 to-white'
      }`}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Primary floating orbs */}
        <motion.div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-blue-500/20' : 'bg-pink-200/40'
            }`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-purple-500/20' : 'bg-blue-200/40'
            }`}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className={`absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl ${isDark ? 'bg-pink-500/20' : 'bg-purple-200/40'
            }`}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Secondary floating elements */}
        <motion.div
          className={`absolute top-1/2 right-1/4 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-200/30'
            }`}
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 right-10 w-56 h-56 rounded-full blur-3xl ${isDark ? 'bg-indigo-500/15' : 'bg-indigo-200/30'
            }`}
          animate={{
            x: [0, 20, 0],
            y: [0, -25, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        <motion.div
          className={`absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-rose-500/15' : 'bg-rose-200/30'
            }`}
          animate={{
            x: [0, 45, 0],
            y: [0, -15, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />

        {/* Tertiary ambient elements */}
        <motion.div
          className={`absolute bottom-1/2 left-10 w-40 h-40 rounded-full blur-3xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-200/25'
            }`}
          animate={{
            x: [0, 15, 0],
            y: [0, 30, 0],
            scale: [1, 1.4, 1]
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />
        <motion.div
          className={`absolute top-3/4 right-1/3 w-52 h-52 rounded-full blur-3xl ${isDark ? 'bg-violet-500/10' : 'bg-violet-200/25'
            }`}
          animate={{
            x: [0, -35, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7
          }}
        />
      </div>

      {/* Navigation */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full backdrop-blur-xl transition-all duration-300 border shadow-lg ${isDark
            ? 'bg-gray-900/40 hover:bg-gray-800/60 text-yellow-400 border-gray-700/50'
            : 'bg-white/40 hover:bg-white/60 text-gray-600 border-white/50'
            }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <FloatingNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-8"
            >
              <motion.div
                className="inline-block"
                animate={floatingAnimation}
              >
                <span className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-medium backdrop-blur-xl border ${isDark
                  ? 'bg-blue-500/20 border-blue-400/30 text-blue-200'
                  : 'bg-blue-200/30 border-blue-300/30 text-blue-700'
                  }`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Trusted by 50,000+ users worldwide
                </span>
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            >
              <motion.span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark
                  ? 'from-white via-blue-200 to-purple-200'
                  : 'from-gray-700 via-pink-600 to-blue-600'
                  }`}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Secure Your
              </motion.span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                Digital Life
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
            >
              The most secure password manager with military-grade encryption,
              PIN protection, and zero-knowledge architecture.
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-semibold">
                Your passwords, your control.
              </span>
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  className="group px-12 py-5 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-bold rounded-2xl hover:from-pink-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-pink-300/25 flex items-center justify-center space-x-3 text-lg"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Free Trial</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              </SignInButton>
              <motion.button
                className={`group px-12 py-5 backdrop-blur-xl font-bold rounded-2xl transition-all duration-300 border text-lg ${isDark
                  ? 'bg-gray-800/30 hover:bg-gray-700/40 text-gray-200 border-gray-600/30 hover:border-gray-500/50'
                  : 'bg-white/30 hover:bg-white/40 text-gray-700 border-pink-200/30 hover:border-pink-300/50'
                  }`}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-3">
                  <span>Watch Demo</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ▶️
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={`backdrop-blur-xl rounded-3xl p-6 border ${isDark
                    ? 'bg-gray-800/20 border-gray-600/30'
                    : 'bg-white/20 border-pink-200/30'
                    }`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 300 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        className={`relative z-10 py-32 backdrop-blur-xl ${isDark ? 'bg-gray-900/20' : 'bg-white/20'
          }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Why Choose SecureVault?
            </motion.h2>
            <p className={`text-2xl max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Built with security-first principles and designed for the modern digital lifestyle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 group relative overflow-hidden ${isDark
                  ? 'bg-gray-800/30 border-gray-600/30 hover:border-blue-400/50'
                  : 'bg-white/30 border-pink-200/30 hover:border-blue-300/50'
                  }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  initial={false}
                />

                <motion.div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-8 shadow-2xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>{feature.title}</h3>

                <p className={`leading-relaxed text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{feature.description}</p>

                {/* Hover effect sparkles */}
                <motion.div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="relative z-10 py-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Trusted by Security Professionals
            </h2>
            <p className={`text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
              See what our users say about SecureVault
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={`backdrop-blur-xl rounded-3xl p-8 border relative overflow-hidden group ${isDark
                  ? 'bg-gray-800/30 border-gray-600/30'
                  : 'bg-white/30 border-pink-200/30'
                  }`}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-pink-400/30"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <div>
                      <h4 className={`font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>{testimonial.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    className={`text-lg italic leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    "{testimonial.content}"
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className={`relative z-10 py-32 backdrop-blur-xl ${isDark
          ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40'
          : 'bg-gradient-to-r from-pink-200/40 to-blue-200/40'
          }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-8"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Ready to Secure Your Digital Life?
            </motion.h2>

            <p className={`text-2xl mb-12 ${isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Join thousands of users who trust SecureVault with their most sensitive data.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
              {[
                "30-day free trial",
                "No credit card required",
                "Cancel anytime"
              ].map((text, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <CheckCircle className="w-6 h-6 text-pink-500" />
                  </motion.div>
                  <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>

            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <motion.button
                className="px-16 py-6 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-bold rounded-2xl hover:from-pink-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-pink-300/25 text-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="flex items-center space-x-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </motion.button>
            </SignInButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className={`relative z-10 backdrop-blur-xl border-t py-16 ${isDark
          ? 'bg-gray-900/40 border-gray-700/30'
          : 'bg-white/40 border-pink-200/30'
          }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center space-x-4 mb-6 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                SecureVault
              </span>
            </motion.div>

            <motion.div
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center md:items-end gap-2">
                <motion.div
                  className="flex items-center gap-2 text-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Made with</span>
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="text-red-500 drop-shadow-md cursor-pointer inline-block"
                  >
                    ❤️
                  </motion.span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>&</span>
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-wide drop-shadow-sm">
                    Se-Curity
                  </span>
                </motion.div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  © 2024 SecureVault. All rights reserved.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
