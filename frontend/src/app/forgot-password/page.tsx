'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins bg-gray-50 pt-24 pb-8 px-4 min-h-screen">
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white shadow-md overflow-hidden flex flex-col md:flex-row">

        {/* ── Left Sidebar ── */}
        <aside className="hidden md:flex w-64 bg-[#F0F4F2] px-7 py-8 flex-col justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Password Reset</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Enter your registered email and we'll send you a secure link to reset your password.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <div className="h-0.5 flex-1 bg-[#1B6B4A]/20 rounded" />
              <span className="text-xs text-[#1B6B4A] font-medium">Secure Reset</span>
              <div className="h-0.5 flex-1 bg-[#1B6B4A]/20 rounded" />
            </div>

            <ul className="mt-6 flex flex-col gap-4">
              {[
                { icon: '🔒', text: 'Encrypted reset link' },
                { icon: '⏱️', text: 'Link expires in 1 hour' },
                { icon: '🛡️', text: 'Single-use token' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-xs text-gray-400 leading-relaxed">
            Trusted by 10,000+ families worldwide for halal matchmaking.
          </p>
        </aside>

        {/* ── Right Form Area ── */}
        <main className="flex-1 px-6 py-8 md:px-10 md:py-8">

          {/* Mobile brand header */}
          <div className="md:hidden mb-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#1B6B4A] mb-3">
              <span className="text-xl">🕌</span>
            </div>
            <p className="text-xs font-medium text-[#1B6B4A] uppercase tracking-widest">Muslim Nikah</p>
          </div>

          <div className="w-full max-w-md mx-auto">

            {!sent ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link href="/login" className="text-[#1B6B4A] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>

                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/15 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-xl bg-[#1B6B4A] py-3.5 text-sm font-semibold text-white hover:bg-[#155a3d] active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              /* ── Success state ── */
              <div className="py-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-100 mb-5">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
                <p className="text-sm text-gray-500 leading-relaxed mb-1">
                  We've sent a password reset link to{' '}
                  <span className="font-semibold text-gray-700">{email}</span>.
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The link expires in <strong className="text-gray-500">1 hour</strong>.
                  Check your spam folder if you don't see it.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Try a different email
                  </button>
                  <Link
                    href="/login"
                    className="w-full rounded-xl bg-[#1B6B4A] py-3 text-sm font-semibold text-white hover:bg-[#155a3d] transition text-center shadow-md"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
