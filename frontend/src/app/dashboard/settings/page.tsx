'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/services/api';
import { Eye, EyeOff, Phone, Lock, CheckCircle2, Save, User } from 'lucide-react';

/* ── Small reusable toast ───────────────────────────────────────────── */
function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in
      ${ok ? 'bg-[#1C3B35] text-white' : 'bg-red-500 text-white'}`}>
      <span>{ok ? '✓' : '✕'}</span>
      {msg}
    </div>
  );
}

/* ── Section card ──────────────────────────────────────────────────── */
function Card({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#1C3B35]/8 flex items-center justify-center text-[#1C3B35]">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#121514]">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── Input helper ─────────────────────────────────────────────────── */
function InputField({
  label, value, onChange, placeholder, icon, type = 'text', right, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ReactNode; type?: string;
  right?: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border pl-10 pr-${right ? '10' : '4'} py-2.5 text-sm text-gray-800 bg-gray-50
            outline-none focus:bg-white focus:border-[#1C3B35] focus:ring-2 focus:ring-[#1C3B35]/10 transition
            ${error ? 'border-red-300' : 'border-gray-200'}`}
        />
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function UserSettingsPage() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => setToast({ msg, ok });

  /* ── Account details state ─────────────────────────────────────── */
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [savedWhatsapp, setSavedWhatsapp] = useState('');
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [whatsappVisible, setWhatsappVisible] = useState(true);
  const [savedPhoneVisible, setSavedPhoneVisible] = useState(true);
  const [savedWhatsappVisible, setSavedWhatsappVisible] = useState(true);

  useEffect(() => {
    userApi.getMe()
      .then(r => {
        const d = r.data ?? {};
        setEmail(d.email ?? '');
        setPhone(d.phone ?? '');
        setWhatsapp(d.whatsappNumber ?? '');
        setSavedPhone(d.phone ?? '');
        setSavedWhatsapp(d.whatsappNumber ?? '');
        setPhoneVisible(d.phoneVisible !== false);
        setWhatsappVisible(d.whatsappVisible !== false);
        setSavedPhoneVisible(d.phoneVisible !== false);
        setSavedWhatsappVisible(d.whatsappVisible !== false);
      })
      .catch(() => showToast('Failed to load account details.', false))
      .finally(() => setLoadingUser(false));
  }, []);

  const detailsDirty =
    phone !== savedPhone ||
    whatsapp !== savedWhatsapp ||
    phoneVisible !== savedPhoneVisible ||
    whatsappVisible !== savedWhatsappVisible;

  const saveDetails = async () => {
    setSavingDetails(true);
    try {
      await userApi.updateMe({
        phone: phone || undefined,
        whatsappNumber: whatsapp || undefined,
        phoneVisible,
        whatsappVisible,
      });
      setSavedPhone(phone);
      setSavedWhatsapp(whatsapp);
      setSavedPhoneVisible(phoneVisible);
      setSavedWhatsappVisible(whatsappVisible);
      showToast('Account details updated successfully!');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to save.', false);
    } finally {
      setSavingDetails(false);
    }
  };

  /* ── Change password state ─────────────────────────────────────── */
  const [savingPw, setSavingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  // Password strength
  const strength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][strength];

  const validatePw = () => {
    const errs: typeof pwErrors = {};
    if (!currentPw) errs.current = 'Enter your current password.';
    if (newPw.length < 8) errs.new = 'Must be at least 8 characters.';
    if (newPw !== confirmPw) errs.confirm = "Passwords don't match.";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const changePw = async () => {
    if (!validatePw()) return;
    setSavingPw(true);
    try {
      await userApi.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwErrors({});
      showToast('Password changed successfully!');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to change password.', false);
    } finally {
      setSavingPw(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="font-poppins space-y-6 max-w-2xl">
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

      {/* Page header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#121514]">Account Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your contact details and password.</p>
      </div>

      {/* ── Account Details ─────────────────────────────────────── */}
      <Card
        title="Account Details"
        subtitle="Update your contact information"
        icon={<User className="w-4.5 h-4.5" />}
      >
        {loadingUser ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading…
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email — read-only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="min-w-0 flex-1 break-all text-sm text-gray-500">{email}</span>
                <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium shrink-0 sm:ml-auto">Read-only</span>
              </div>
              <p className="text-[11px] text-gray-400">Email cannot be changed. Contact support if needed.</p>
            </div>

            {/* Mobile */}
            <InputField
              label="Mobile Number"
              value={phone}
              onChange={setPhone}
              placeholder="+94 7X XXX XXXX"
              icon={<Phone className="w-4 h-4" />}
            />

            {/* WhatsApp */}
            <InputField
              label="WhatsApp Number"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="+94 7X XXX XXXX"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              }
            />

            {/* ── Privacy Toggles ─────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Contact Number Privacy
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed -mt-1">
                Control who can see your phone and WhatsApp numbers on your public profile.
              </p>

              {/* Mobile toggle */}
              <div className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Show Mobile Number</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {phoneVisible ? 'Visible to other members' : 'Hidden from other members'}
                  </p>
                </div>
                <button
                  id="toggle-phone-visible"
                  type="button"
                  onClick={() => setPhoneVisible(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1C3B35]/30
                    ${phoneVisible ? 'bg-[#1C3B35]' : 'bg-gray-300'}`}
                  aria-pressed={phoneVisible}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition duration-200
                      ${phoneVisible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              {/* WhatsApp toggle */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Show WhatsApp Number</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {whatsappVisible ? 'Visible to other members' : 'Hidden from other members'}
                  </p>
                </div>
                <button
                  id="toggle-whatsapp-visible"
                  type="button"
                  onClick={() => setWhatsappVisible(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1C3B35]/30
                    ${whatsappVisible ? 'bg-[#1C3B35]' : 'bg-gray-300'}`}
                  aria-pressed={whatsappVisible}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition duration-200
                      ${whatsappVisible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={saveDetails}
                disabled={savingDetails || !detailsDirty}
                className="flex items-center gap-2 bg-[#1C3B35] hover:bg-[#15302a] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
              >
                {savingDetails ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              {!detailsDirty && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Up to date
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── Change Password ─────────────────────────────────────── */}
      <Card
        title="Change Password"
        subtitle="Update your account password"
        icon={<Lock className="w-4.5 h-4.5" />}
      >
        <div className="space-y-4">
          {/* Current password */}
          <InputField
            label="Current Password"
            value={currentPw}
            onChange={v => { setCurrentPw(v); setPwErrors(p => ({ ...p, current: undefined })); }}
            placeholder="Enter current password"
            type={showCurrent ? 'text' : 'password'}
            icon={<Lock className="w-4 h-4" />}
            error={pwErrors.current}
            right={
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition p-0.5">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* New password */}
          <div>
            <InputField
              label="New Password"
              value={newPw}
              onChange={v => { setNewPw(v); setPwErrors(p => ({ ...p, new: undefined })); }}
              placeholder="Min. 8 characters"
              type={showNew ? 'text' : 'password'}
              icon={<Lock className="w-4 h-4" />}
              error={pwErrors.new}
              right={
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="text-gray-400 hover:text-gray-600 transition p-0.5">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {/* Strength meter */}
            {newPw && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <InputField
            label="Confirm New Password"
            value={confirmPw}
            onChange={v => { setConfirmPw(v); setPwErrors(p => ({ ...p, confirm: undefined })); }}
            placeholder="Repeat new password"
            type={showConfirm ? 'text' : 'password'}
            icon={<Lock className="w-4 h-4" />}
            error={pwErrors.confirm}
            right={
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition p-0.5">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <button
            type="button"
            onClick={changePw}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 bg-[#1C3B35] hover:bg-[#15302a] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm mt-1"
          >
            {savingPw ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Updating…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </Card>

      {/* ── Danger Zone ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#121514]">Account Security</h2>
            <p className="text-xs text-gray-400">Important account information</p>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <p className="font-medium mb-1">🔐 Security Tips</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Use a strong password with letters, numbers and symbols</li>
              <li>Never share your password with anyone</li>
              <li>If you suspect unauthorised access, change your password immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
