import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LandingPage } from './components/Landing/LandingPage'
import { Dashboard } from './components/Dashboard/Dashboard'

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function App() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-white font-bold text-2xl mb-4">Setup Required</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Please add your <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> to the <code>.env</code> file and restart the development server.
          </p>
          <div className="bg-black/40 p-4 rounded-2xl text-left font-mono text-sm text-blue-300 border border-white/5">
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
          </div>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={
                  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                }>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn signInFallbackRedirectUrl="/dashboard" />
                  </SignedOut>
                </Suspense>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App