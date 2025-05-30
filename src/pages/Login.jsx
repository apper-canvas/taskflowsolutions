import { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'

function Login() {
  const { isInitialized } = useContext(AuthContext)

  useEffect(() => {
    if (isInitialized) {
      // Show login UI in this component
      const { ApperUI } = window.ApperSDK
      ApperUI.showLogin("#authentication")
    }
  }, [isInitialized])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="w-full max-w-md space-y-8 p-6 bg-white/80 dark:bg-surface-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Sign in to your TaskFlow account</p>
        </div>
        <div id="authentication" className="min-h-[400px]" />
        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login