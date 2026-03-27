'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = (status?: string) => {
    setLoading(true);
    adminApi.payments(status !== 'ALL' ? status : undefined)
      .then((r) => setPayments(r.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const approve = async (paymentId: string) => {
    const note = prompt('Admin note (optional):') ?? '';
    setApprovingId(paymentId);
    try {
      await adminApi.approvePayment({ paymentId, adminNote: note || undefined });
      setMessage(`Payment ${paymentId.slice(0, 8)}... approved successfully!`);
      setTimeout(() => setMessage(''), 4000);
      load(filter);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="font-poppins">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve bank transfer payments</p>
        </div>
        <div className="flex gap-2">
          {['PENDING', 'SUCCESS', 'FAILED', 'ALL'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-2 rounded-xl font-medium transition ${filter === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="mb-4 p-4 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">{message}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">💳</p>
          <p>No payments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Payment ID', 'User', 'Profile', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-700">{p.user?.email ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{p.childProfile?.name ?? '-'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">${p.amount} {p.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.method === 'BANK_TRANSFER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {p.status === 'PENDING' && (
                      <button onClick={() => approve(p.id)} disabled={approvingId === p.id}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                        {approvingId === p.id ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
