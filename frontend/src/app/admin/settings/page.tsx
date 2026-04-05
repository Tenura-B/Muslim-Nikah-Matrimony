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

/* ── reusable text field ─────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, mono = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:border-[#1C3B35] outline-none transition ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

/* ── Bank Account sub-form ───────────────────────────────────────────── */
function BankCard({ index, accName, accNo, bankName, branch, onChange }: {
  index: number;
  accName: string; accNo: string; bankName: string; branch: string;
  onChange: (field: string, val: string) => void;
}) {
  const prefix = `bank${index}`;
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
      <p className="text-xs font-bold text-[#1C3B35] uppercase tracking-wide flex items-center gap-1.5">
        <span className="h-5 w-5 rounded-full bg-[#1C3B35] text-white flex items-center justify-center text-[10px] font-extrabold">{index}</span>
        Bank Account {index}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Account Name"
          value={accName}
          onChange={v => onChange(`${prefix}AccName`, v)}
          placeholder="e.g. M T M Akram"
        />
        <Field
          label="Account Number"
          value={accNo}
          onChange={v => onChange(`${prefix}AccNo`, v)}
          placeholder="e.g. 112054094468"
          mono
        />
        <Field
          label="Bank Name"
          value={bankName}
          onChange={v => onChange(`${prefix}BankName`, v)}
          placeholder="e.g. Sampath Bank PLC"
        />
        <Field
          label="Branch"
          value={branch}
          onChange={v => onChange(`${prefix}Branch`, v)}
          placeholder="e.g. Ratmalana"
        />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  /* ── discount state ──────────────────────────────────────────────── */
  const [discountPct, setDiscountPct] = useState('');
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountActive, setDiscountActive] = useState(false);

  /* ── currency state ─────────────────────────────────────────────── */
  const [currency, setCurrency] = useState('LKR');

  /* ── payment contact state ──────────────────────────────────────── */
  const [whatsappContact, setWhatsappContact] = useState('+94 705 687 697');

  /* ── bank account state ─────────────────────────────────────────── */
  const [bank1AccName, setBank1AccName] = useState('M T M Akram');
  const [bank1AccNo, setBank1AccNo] = useState('112054094468');
  const [bank1BankName, setBank1BankName] = useState('Sampath Bank PLC');
  const [bank1Branch, setBank1Branch] = useState('Ratmalana');
  const [bank2AccName, setBank2AccName] = useState('M T M Akram');
  const [bank2AccNo, setBank2AccNo] = useState('89870069');
  const [bank2BankName, setBank2BankName] = useState('BOC');
  const [bank2Branch, setBank2Branch] = useState('Anuradhapura');

  const bankSetters: Record<string, (v: string) => void> = {
    bank1AccName: setBank1AccName,
    bank1AccNo: setBank1AccNo,
    bank1BankName: setBank1BankName,
    bank1Branch: setBank1Branch,
    bank2AccName: setBank2AccName,
    bank2AccNo: setBank2AccNo,
    bank2BankName: setBank2BankName,
    bank2Branch: setBank2Branch,
  };

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    adminApi.getSiteSettings()
      .then((r) => {
        const d = r.data ?? {};
        setDiscountPct(String(d.siteDiscountPct ?? 0));
        setDiscountLabel(d.siteDiscountLabel ?? '');
        setDiscountActive(d.siteDiscountActive ?? false);
        setCurrency(d.platformCurrency ?? 'LKR');
        setWhatsappContact(d.whatsappContact ?? '+94 705 687 697');
        setBank1AccName(d.bank1AccName ?? 'M T M Akram');
        setBank1AccNo(d.bank1AccNo ?? '112054094468');
        setBank1BankName(d.bank1BankName ?? 'Sampath Bank PLC');
        setBank1Branch(d.bank1Branch ?? 'Ratmalana');
        setBank2AccName(d.bank2AccName ?? 'M T M Akram');
        setBank2AccNo(d.bank2AccNo ?? '89870069');
        setBank2BankName(d.bank2BankName ?? 'BOC');
        setBank2Branch(d.bank2Branch ?? 'Anuradhapura');
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
        whatsappContact,
        bank1AccName, bank1AccNo, bank1BankName, bank1Branch,
        bank2AccName, bank2AccNo, bank2BankName, bank2Branch,
      });
      bustCurrencyCache();
      showToast('Settings saved! All changes are live.');
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
        <p className="text-sm text-gray-400 mt-0.5">Configure currency, discounts, payment contact, and bank accounts.</p>
      </div>

      {/* ── Currency Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
                    : 'border-gray-200 bg-gray-50 hover:border-[#1C3B35]/40'
                }`}
              >
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
                  type="number" min={0} max={100} step={1}
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

      {/* ── Payment Contact ──────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#121514]">WhatsApp Contact</h2>
            <p className="text-xs text-gray-400">The WhatsApp number shown on the payment page for receipt submission.</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <Field
            label="WhatsApp Number"
            value={whatsappContact}
            onChange={setWhatsappContact}
            placeholder="+94 705 687 697"
          />
          <p className="text-[11px] text-gray-400 mt-2">Include country code. This will be displayed on the Select Package / Checkout page.</p>
        </div>
      </div>

      {/* ── Bank Accounts ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1C3B35]/8 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#121514]">Bank Account Details</h2>
            <p className="text-xs text-gray-400">These two bank accounts will appear on the payment page for transfers.</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <BankCard
            index={1}
            accName={bank1AccName}
            accNo={bank1AccNo}
            bankName={bank1BankName}
            branch={bank1Branch}
            onChange={(field, val) => bankSetters[field]?.(val)}
          />
          <BankCard
            index={2}
            accName={bank2AccName}
            accNo={bank2AccNo}
            bankName={bank2BankName}
            branch={bank2Branch}
            onChange={(field, val) => bankSetters[field]?.(val)}
          />
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
