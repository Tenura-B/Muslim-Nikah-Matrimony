'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';

type Payment = {
  id: string; amount: number; currency: string; method: string;
  status: string; bankRef?: string; createdAt: string;
  user?: { email: string }; childProfile?: { name: string };
};

const STATUS_OPTIONS = ['ALL', 'PENDING', 'SUCCESS', 'FAILED'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const PER_PAGE = 10;

  const load = () => {
    setLoading(true);
    adminApi.payments(filter === 'ALL' ? undefined : filter)
      .then((r) => setPayments(r.data ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); setPage(1); }, [filter]);

  const approve = async (id: string) => {
    const note = prompt('Admin note (optional):');
    setApproving(id);
    try {
      await adminApi.approvePayment({ paymentId: id, adminNote: note ?? '' });
      setMessage({ text: 'Payment approved — profile activated!', ok: true });
      load();
    } catch (e: any) {
      setMessage({ text: e.message, ok: false });
    } finally {
      setApproving(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      SUCCESS: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[s] ?? 'bg-gray-100 text-gray-600';
  };

  const totalPages = Math.ceil(payments.length / PER_PAGE);
  const pageData = payments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="font-poppins space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Review and approve bank transfer payments</p>
        </div>
        {/* Stats pills */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.filter(s => s !== 'ALL').map((s) => {
            const count = payments.filter(p => p.status === s).length;
            return (
              <span key={s} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusBadge(s)}`}>
                {count} {s.charAt(0) + s.slice(1).toLowerCase()}
              </span>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${message.ok ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {message.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all ${filter === s ? 'bg-[#1C3B35] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
              {s !== 'ALL' && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {payments.filter(p => p.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>
          ) : pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-3xl mb-2">💳</span>
              <p className="text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} payments found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID', 'User', 'Profile', 'Amount', 'Method', 'Bank Ref', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageData.map((p, i) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition ${i % 2 === 1 ? 'bg-[#FAFAFA]' : ''}`}>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5 text-gray-700">{p.user?.email ?? '—'}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{p.childProfile?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">${p.amount} <span className="text-xs text-gray-400 font-normal">{p.currency}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.method === 'BANK_TRANSFER' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {p.method === 'BANK_TRANSFER' ? 'Bank' : 'Gateway'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.bankRef ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadge(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      {p.status === 'PENDING' && (
                        <button onClick={() => approve(p.id)} disabled={approving === p.id}
                          className="text-xs bg-[#1C3B35] text-white px-3 py-1.5 rounded-lg hover:bg-[#15302a] transition disabled:opacity-50 font-semibold">
                          {approving === p.id ? '…' : 'Approve'}
                        </button>
                      )}
                      {p.status === 'SUCCESS' && (
                        <span className="text-xs text-green-600 font-medium">✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && payments.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, payments.length)} of {payments.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${page === i + 1 ? 'bg-[#1C3B35] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
