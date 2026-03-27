'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/profiles', label: 'Profiles', icon: '👤' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl min-h-screen hidden md:flex">
          <div className="px-6 py-5 border-b border-white/10">
            <h1 className="font-poppins font-bold text-lg">Admin Panel</h1>
            <p className="text-white/50 text-xs mt-0.5">Muslim Nikah System</p>
          </div>
          <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
            {adminLinks.map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition">
                <span>{item.icon}</span>{item.label}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <a href="/login" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
              <span>🚪</span> Sign Out
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
