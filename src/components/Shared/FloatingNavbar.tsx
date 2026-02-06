import { useState } from 'react'
import { Eye, Shield, Lock, FileText, X, CheckCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

interface TabContent {
    title: string
    icon: any
    color: string
    content: React.ReactNode
}

interface FloatingNavbarProps {
    // No props needed for landing version currently
}

const infoContent: Record<string, TabContent> = {
    'know-more': {
        title: 'About SecureVault',
        icon: FileText,
        color: 'from-blue-400 to-cyan-400',
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed text-sm">
                    Welcome to SecureVault. By interacting with our platform, you acknowledge our commitment to absolute data sovereignty. We believe privacy is a fundamental human right, not a feature.
                </p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-semibold text-white text-sm">Zero Data Collection</h5>
                            <p className="text-xs text-gray-400 mt-1">We do not track, analyze, or sell your personal usage data.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-semibold text-white text-sm">Ownership</h5>
                            <p className="text-xs text-gray-400 mt-1">You retain 100% intellectual property rights to all stored credentials.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    'encryption': {
        title: 'Encryption Standards',
        icon: Lock,
        color: 'from-purple-400 to-pink-400',
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed text-sm">
                    We employ military-grade AES-256 bit encryption, ensuring that brute-forcing your password would take longer than the age of the universe.
                </p>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 space-y-3">
                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-700/50 pb-2">
                        <span className="text-gray-400">Algorithm</span>
                        <span className="text-purple-300 font-mono text-xs">AES-256-GCM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-700/50 pb-2">
                        <span className="text-gray-400">Key Derivation</span>
                        <span className="text-purple-300 font-mono text-xs">PBKDF2 SHA-256</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-400">Hashing</span>
                        <span className="text-purple-300 font-mono text-xs">Argon2id</span>
                    </div>
                </div>
            </div>
        )
    },
    'security': {
        title: 'Security Architecture',
        icon: Shield,
        color: 'from-emerald-400 to-teal-400',
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed text-sm">
                    Our Zero-Knowledge architecture ensures that <span className="text-emerald-400 font-semibold">we cannot see your data</span>. Your master password is never transmitted to us.
                </p>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Client-side Decryption Only</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>No backdoor access</span>
                    </div>
                </div>
            </div>
        )
    }
}

export function FloatingNavbar({ }: FloatingNavbarProps) {
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const { isSignedIn } = useUser()
    const { isDark } = useTheme()
    const navigate = useNavigate()

    return (
        <>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-6 left-[34%] transform -translate-x-1/2 z-50 w-full px-4 max-w-2xl"
            >
                <div className={`${isDark ? 'bg-black/20 text-white border-white/10' : 'bg-white/60 text-gray-900 border-black/5 shadow-xl'} rounded-full px-2 py-2 pl-4 flex items-center justify-between backdrop-blur-xl transition-colors duration-300 relative`}>

                    {/* Left Section: Logo */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(null)}>
                            <div className={`${isDark ? 'bg-white/10' : 'bg-black/5'} p-1.5 rounded-full transition-colors`}>
                                <Eye className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent hidden sm:block">SecureVault</span>
                        </div>
                    </div>

                    {/* Landing Navigation Links */}
                    <div className={`hidden md:flex items-center ${isDark ? 'bg-black/20 border-white/5' : 'bg-black/5 border-black/5'} rounded-full p-1 border transition-colors`}>
                        {[
                            { id: 'know-more', label: 'About Us' },
                            { id: 'encryption', label: 'Encryption' },
                            { id: 'security', label: 'Security' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                                className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? isDark ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' : 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Landing Action Button */}
                    <div>
                        {isSignedIn ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/5'} px-5 py-2.5 rounded-full text-xs font-semibold transition-all border shadow-lg flex items-center gap-2 group`}
                            >
                                Dashboard
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        ) : (
                            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className={`${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/5'} px-5 py-2.5 rounded-full text-xs font-semibold transition-all border shadow-lg flex items-center gap-2 group`}>
                                    Get Started
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Info Modal Overlay (Landing Only) */}
            <AnimatePresence>
                {activeTab && infoContent[activeTab] && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveTab(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-28 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4"
                        >
                            <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Modal Header */}
                                <div className={`p-6 bg-gradient-to-r ${infoContent[activeTab].color} relative`}>
                                    <button
                                        onClick={() => setActiveTab(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl">
                                            {(() => {
                                                const Icon = infoContent[activeTab].icon
                                                return <Icon className="w-6 h-6 text-white" />
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{infoContent[activeTab].title}</h3>
                                            <p className="text-white/80 text-xs font-medium">SecureVault Information</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 bg-[#1a1a1a]">
                                    {infoContent[activeTab].content}

                                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                                        <button
                                            onClick={() => setActiveTab(null)}
                                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
