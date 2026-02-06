import { Eye, Plus, User, LogOut, Search, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useTheme } from '../../contexts/ThemeContext'

interface DashboardNavbarProps {
    onAddPassword?: () => void
    onProfileClick?: () => void
    searchTerm?: string
    setSearchTerm?: (term: string) => void
    profilePhoto?: string | null
}

export function DashboardNavbar({ onAddPassword, onProfileClick, searchTerm, setSearchTerm, profilePhoto }: DashboardNavbarProps) {
    const { user } = useUser()
    const { signOut } = useClerk()
    const { isDark, toggleTheme } = useTheme()

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-6 left-[25%] transform -translate-x-1/2 z-50 w-full max-w-5xl px-4"
        >
            <div className={`${isDark ? 'bg-black/20 text-white border-white/10' : 'bg-white/60 text-gray-900 border-black/5 shadow-xl'} rounded-full px-2 py-2 pl-4 flex items-center justify-between backdrop-blur-xl transition-colors duration-300 relative`}>

                {/* Left Section: Logo */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`${isDark ? 'bg-white/10' : 'bg-black/5'} p-1.5 rounded-full transition-colors`}>
                            <Eye className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent hidden sm:block">SecureVault</span>
                    </div>
                </div>

                {/* Dashboard Center: Search Bar */}
                <div className="flex-1 max-w-md mx-6 hidden md:block">
                    <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className={`relative flex items-center px-4 py-2 rounded-full border transition-all ${isDark ? 'bg-black/40 border-white/10 focus-within:border-pink-500/50 focus-within:bg-black/60' : 'bg-white/50 border-black/5 focus-within:border-pink-500/50 focus-within:bg-white/80'}`}>
                            <Search className={`w-4 h-4 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm?.(e.target.value)}
                                placeholder="Search passwords..."
                                className={`w-full bg-transparent border-none focus:outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Dashboard Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={onAddPassword}
                        className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border shadow-lg group ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-black/5 hover:bg-black/10 border-black/5 text-gray-900'}`}
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span>Add New</span>
                    </button>

                    <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-black/10'} mx-1 hidden sm:block`} />
                    <button
                        onClick={onAddPassword}
                        className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onProfileClick}
                        className="relative group"
                    >
                        {profilePhoto || user?.imageUrl ? (
                            <img src={profilePhoto || user?.imageUrl} alt="Profile" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>

                    <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-black/10'} mx-1 hidden sm:block`} />

                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'text-yellow-400 hover:bg-white/5' : 'text-gray-500 hover:bg-black/5 hover:text-blue-600'}`}
                        title={isDark ? "Light Mode" : "Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => signOut()}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-white/5' : 'text-gray-500 hover:text-red-500 hover:bg-black/5'}`}
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
