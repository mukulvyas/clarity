'use client'

import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    
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
          <h1 className="text-headline-lg text-[#1e1b18] mb-2">Join Clarity</h1>
          <p className="text-body-md text-[#414944]">Your personal legal companion.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-[#ffdad6] text-[#93000a] text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-[#1e1b18] mb-1.5" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-label-md text-[#1e1b18] mb-1.5" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
                placeholder="Doe"
              />
            </div>
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-label-md text-[#1e1b18] mb-1.5" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-[#f5ece7] border border-transparent focus:bg-white focus:border-[#3e6b56] focus:ring-1 focus:ring-[#3e6b56] outline-none transition-all text-body-md text-[#1e1b18]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#3e6b56] text-white text-label-lg hover:bg-[#25533f] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(37,83,63,0.2)] mt-4"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 text-center text-body-sm text-[#414944]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#3e6b56] font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
