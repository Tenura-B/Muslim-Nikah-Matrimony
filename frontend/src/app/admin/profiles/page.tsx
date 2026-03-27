'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = (s?: string) => {
    setLoading(true);
    adminApi.profiles(s !== 'ALL' ? s : undefined)
      .then((r) => setProfiles(r.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  return (
    <div className="font-poppins">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">{profiles.length} profiles</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'DRAFT', 'ACTIVE', 'PAYMENT_PENDING', 'EXPIRED'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-2 rounded-xl font-medium transition ${filter === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">👤</p><p>No profiles found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Gender', 'Owner', 'Country', 'Status', 'Subscription', 'Created'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.user?.email ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.country ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      p.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                      p.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.subscription ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.subscription.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {p.subscription.status}
                      </span>
                    ) : <span className="text-gray-400 text-xs">None</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
