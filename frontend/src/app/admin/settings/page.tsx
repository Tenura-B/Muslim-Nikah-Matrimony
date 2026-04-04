'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { bustCurrencyCache } from '@/hooks/useCurrency';

const CURRENCIES = [
  {
    code: 'LKR',
    name: 'Sri Lankan Rupee',
    symbol: 'Rs',
    flag: '🇱🇰',
    desc: 'Used for local Sri Lanka transactions',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    desc: 'International standard currency',
  },
];

/* ── small status toast ─────────────────────────────────────────────── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${ok ? 'bg-[#1C3B35] text-white' : 'bg-red-500 text-white'}`}>
      <span>{ok ? '✓' : '✕'}</span>
      {msg}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  /* ── discount state ──────────────────────────────────────────────── */
  const [discountPct, setDiscountPct] = useState('');
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountActive, setDiscountActive] = useState(false);

  /* ── currency state ─────────────────────────────────────────────── */
  const [currency, setCurrency] = useState('LKR');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    adminApi.getSiteSettings()
      .then((r) => {
        const d = r.data ?? {};
        setSettings(d);
        setDiscountPct(String(d.siteDiscountPct ?? 0));
        setDiscountLabel(d.siteDiscountLabel ?? '');
        setDiscountActive(d.siteDiscountActive ?? false);
        setCurrency(d.platformCurrency ?? 'LKR');
      })
      .catch(() => showToast('Failed to load settings', false))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSiteSettings({
        siteDiscountPct: parseFloat(discountPct) || 0,
        siteDiscountLabel: discountLabel,
        siteDiscountActive: discountActive,
        platformCurrency: currency,
      });
      // Bust the cache so all pages pick up the new currency immediately
      bustCurrencyCache();
      showToast('Settings saved! Currency will update on all pages.');
    } catch (e: any) {
      showToast(e.message ?? 'Save failed', false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-400 font-poppins">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading settings…
    </div>
  );

  return (
    <div className="font-poppins space-y-8 max-w-3xl">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#121514]">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure global platform behaviour — currency, discounts and more.</p>
      </div>

      {/* ── Currency Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* card header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1C3B35]/8 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#121514]">Platform Currency</h2>
            <p className="text-xs text-gray-400">Prices across the platform will display in this currency.</p>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CURRENCIES.map((c) => {
            const selected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  selected
                    ? 'border-[#1C3B35] bg-[#1C3B35]/5 shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:border-[#1C3B35]/40 hover:bg-[#1C3B35]/3'
                }`}
              >
                {/* radio dot */}
                <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  selected ? 'border-[#1C3B35] bg-[#1C3B35]' : 'border-gray-300 bg-white'
                }`}>
                  {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-bold text-[#121514] text-sm">{c.code}</span>
                    <span className="text-xs text-gray-400 font-mono">{c.symbol}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{c.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.desc}</p>
                </div>

                {selected && (
                  <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#1C3B35] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* current selection pill */}
        <div className="px-6 pb-5">
          <div className="flex items-center gap-2 bg-[#F0F4F2] rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-[#1C3B35] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
            </svg>
            <p className="text-xs text-[#1C3B35] font-medium">
              All prices will be displayed in <strong>{CURRENCIES.find(c => c.code === currency)?.name ?? currency}</strong> ({CURRENCIES.find(c => c.code === currency)?.symbol}).
              Existing package prices are stored as numbers — changing currency only changes the symbol shown.
            </p>
          </div>
        </div>
      </div>

      {/* ── Site-wide Discount Card ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#121514]">Site-wide Discount</h2>
            <p className="text-xs text-gray-400">Apply a % discount on top of all active packages.</p>
          </div>
          {/* Active toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">{discountActive ? 'Active' : 'Off'}</span>
            <button
              type="button"
              onClick={() => setDiscountActive(!discountActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none ${
                discountActive ? 'bg-[#1C3B35]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${discountActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Discount % <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:border-[#1C3B35] outline-none transition"
                  placeholder="e.g. 20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Label (optional)</label>
              <input
                type="text"
                value={discountLabel}
                onChange={(e) => setDiscountLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:border-[#1C3B35] outline-none transition"
                placeholder="e.g. Ramadan Special"
              />
            </div>
          </div>

          {discountActive && parseFloat(discountPct) > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
              <span>🏷️</span>
              A <strong>{discountPct}%</strong> discount{discountLabel ? ` (${discountLabel})` : ''} will appear on the pricing page for all packages.
            </div>
          )}
        </div>
      </div>

      {/* ── Save button ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1C3B35] hover:bg-[#15302a] disabled:opacity-60 text-white font-semibold text-sm px-7 py-3 rounded-2xl transition-all shadow-sm"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        <p className="text-xs text-gray-400">Changes apply immediately across the platform.</p>
      </div>
    </div>
  );
}
