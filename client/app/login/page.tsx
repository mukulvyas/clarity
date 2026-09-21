'use client'

import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(44,40,37,0.06)] border border-[#e9e1dc]">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[#bceed3] rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="h-6 w-6"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="8" y="7" width="14" height="18" rx="2" fill="#fff8f5" />
              <path d="M11 12h8M11 15h6M11 18h4" stroke="#25533f" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-headline-lg text-[#1e1b18] mb-2">Welcome back</h1>
          <p className="text-body-md text-[#414944]">Log in to access your legal documents.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-label-md text-[#1e1b18] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-label-md text-[#1e1b18] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#3e6b56] text-white text-label-lg hover:bg-[#25533f] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(37,83,63,0.2)] mt-2"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-8 text-center text-body-sm text-[#414944]">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#3e6b56] font-medium hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
