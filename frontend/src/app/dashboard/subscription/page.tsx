'use client';

import { useEffect, useState } from 'react';
import { subscriptionApi, paymentApi } from '@/services/api';

export default function SubscriptionPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([subscriptionApi.mySubscriptions(), paymentApi.myPayments()])
      .then(([s, p]) => { setSubs(s.data ?? []); setPayments(p.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const initiate = async (profileId: string, method: 'GATEWAY' | 'BANK_TRANSFER', bankRef?: string, bankSlipUrl?: string) => {
    try {
      const res = await paymentApi.initiate({ childProfileId: profileId, amount: 29.99, method, bankRef, bankSlipUrl });
      setMessage(`Payment initiated (${method}). Payment ID: ${res.data.id}. ${method === 'BANK_TRANSFER' ? 'Awaiting admin approval.' : 'Redirect to gateway to complete.'}`);
      setTimeout(() => setMessage(''), 8000);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="font-poppins">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
        <p className="text-gray-500 text-sm mt-1">Manage subscriptions for each profile independently</p>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-xl bg-blue-50 text-blue-700 text-sm border border-blue-100">{message}</div>
      )}

      {/* Plan info */}
      <div className="bg-gradient-to-br from-[#1B6B4A] to-[#2d9966] rounded-2xl p-6 text-white mb-6 flex items-center justify-between">
        <div>
          <p className="font-bold text-xl">Standard Plan</p>
          <p className="text-white/80 text-sm mt-1">30-day access · Full profile visibility · Unlimited messaging</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">$29.99</p>
          <p className="text-white/70 text-sm">per profile / month</p>
        </div>
      </div>

      {/* Profile subscriptions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Profile Subscriptions</h2>
        {subs.length === 0 ? (
          <p className="text-gray-400 text-sm">No profiles found. Create a profile first.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  {s.subscription ? (
                    <div className="mt-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        s.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        s.subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>{s.subscription.status}</span>
                      {s.subscription.endDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Expires: {new Date(s.subscription.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No subscription</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(!s.subscription || s.subscription.status !== 'ACTIVE') && (
                    <>
                      <button onClick={() => initiate(s.id, 'GATEWAY')}
                        className="text-xs bg-[#1B6B4A] text-white px-3 py-2 rounded-xl hover:bg-[#155a3d] transition">
                        Pay Online
                      </button>
                      <button onClick={() => {
                        const ref = prompt('Enter bank reference number:');
                        if (ref) initiate(s.id, 'BANK_TRANSFER', ref);
                      }}
                        className="text-xs border border-[#1B6B4A] text-[#1B6B4A] px-3 py-2 rounded-xl hover:bg-[#1B6B4A]/5 transition">
                        Bank Transfer
                      </button>
                    </>
                  )}
                  {s.subscription?.status === 'ACTIVE' && (
                    <span className="text-xs text-green-600 font-medium">✓ Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-gray-400 text-sm">No payments yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{p.method} — ${p.amount} {p.currency}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleString()}</p>
                  {p.bankRef && <p className="text-xs text-gray-500">Ref: {p.bankRef}</p>}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                  p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
