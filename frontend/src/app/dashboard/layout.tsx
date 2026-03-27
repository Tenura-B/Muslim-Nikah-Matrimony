'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1B6B4A] text-white flex flex-col shadow-xl min-h-screen hidden md:flex">
          <div className="px-6 py-5 border-b border-white/10">
            <h1 className="font-poppins font-bold text-lg tracking-wide">Muslim Nikah</h1>
            <p className="text-white/60 text-xs mt-0.5">Member Dashboard</p>
          </div>
          <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
            {[
              { href: '/dashboard/parent', label: 'Overview', icon: '🏠' },
              { href: '/dashboard/profiles', label: 'My Profiles', icon: '👤' },
              { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
              { href: '/dashboard/chat', label: 'Messages', icon: '💬' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <a href="/login" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
              <span>🚪</span> Sign Out
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-8 max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
