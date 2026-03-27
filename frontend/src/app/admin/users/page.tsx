'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { adminApi.users().then((r) => setUsers(r.data ?? [])).finally(() => setLoading(false)); }, []);

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="font-poppins">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-gray-800/10 outline-none w-56" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Email', 'Role', 'Phone', 'Profiles', 'Active', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const activeCount = u.childProfiles?.filter((p: any) => p.status === 'ACTIVE').length ?? 0;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{u.childProfiles?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-semibold">{activeCount}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
