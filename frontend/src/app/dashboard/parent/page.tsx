'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi, subscriptionApi, paymentApi } from '@/services/api';

export default function ParentDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([profileApi.getMyProfiles(), paymentApi.myPayments()])
      .then(([p, pay]) => {
        setProfiles(p.data ?? []);
        setPayments(pay.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeProfiles = profiles.filter((p) => p.status === 'ACTIVE').length;
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="font-poppins">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="text-gray-500 mt-1">Manage your family profiles and subscriptions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Profiles', value: profiles.length, color: 'bg-blue-50 text-blue-700', icon: '👤' },
          { label: 'Active Profiles', value: activeProfiles, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Pending Payments', value: pendingPayments, color: 'bg-amber-50 text-amber-700', icon: '⏳' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color} flex items-center gap-4`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Family Profiles</h2>
          <Link href="/dashboard/profiles/create" className="text-sm bg-[#1B6B4A] text-white px-4 py-2 rounded-xl hover:bg-[#155a3d] transition">
            + Add Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="font-medium">No profiles yet</p>
            <p className="text-sm mt-1">Add your first family member to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.gender} · {p.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    p.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-700' :
                    p.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{p.status}</span>
                  <Link href={`/dashboard/profiles/${p.id}`} className="text-xs text-[#1B6B4A] font-medium hover:underline">
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Payments</h2>
          <div className="flex flex-col gap-2">
            {payments.slice(0, 5).map((pay) => (
              <div key={pay.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{pay.method} — ${pay.amount}</p>
                  <p className="text-xs text-gray-400">{new Date(pay.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  pay.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                  pay.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{pay.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
