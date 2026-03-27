'use client';

import { useEffect, useState } from 'react';
import { profileApi, paymentApi } from '@/services/api';

const STEPS = ['Personal', 'Location & Edu', 'Family', 'Preferences', 'Review'];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({ gender: 'MALE', dateOfBirth: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    profileApi.getMyProfiles()
      .then((r) => setProfiles(r.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleField = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const createProfile = async () => {
    setSaving(true);
    try {
      await profileApi.create(form);
      setMessage('Profile created! Now purchase a subscription to activate it.');
      setShowCreate(false);
      setStep(0);
      setForm({ gender: 'MALE', dateOfBirth: '', name: '' });
      load();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const initiatePayment = async (profileId: string) => {
    try {
      const res = await paymentApi.initiate({ childProfileId: profileId, amount: 29.99, method: 'GATEWAY' });
      // In production, redirect to payment gateway with res.data.id
      setMessage('Payment initiated! (In production, redirect to gateway with payment ID: ' + res.data.id + ')');
      setTimeout(() => setMessage(''), 5000);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    await profileApi.delete(id);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="font-poppins">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your family members' profiles</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1B6B4A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#155a3d] transition"
        >
          + Create Profile
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-xl bg-blue-50 text-blue-700 text-sm border border-blue-100">{message}</div>
      )}

      {/* Create form modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Create Profile — Step {step + 1}/{STEPS.length}</h2>
              <button onClick={() => { setShowCreate(false); setStep(0); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {STEPS.map((s, i) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#1B6B4A]' : 'bg-gray-200'}`} />
              ))}
            </div>

            {/* Step content */}
            {step === 0 && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleField} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" placeholder="Enter name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleField}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleField}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Height (cm)</label>
                    <input type="number" name="height" value={form.height ?? ''} onChange={handleField} placeholder="e.g. 175"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Civil Status</label>
                    <select name="civilStatus" value={form.civilStatus ?? ''} onChange={handleField}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none">
                      <option value="">Select</option>
                      <option>Never Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
                    <input name="country" value={form.country ?? ''} onChange={handleField} placeholder="Sri Lanka"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
                    <input name="city" value={form.city ?? ''} onChange={handleField} placeholder="Colombo"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Education</label>
                  <input name="education" value={form.education ?? ''} onChange={handleField} placeholder="Bachelor's Degree"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Occupation</label>
                  <input name="occupation" value={form.occupation ?? ''} onChange={handleField} placeholder="Software Engineer"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Family Status</label>
                  <select name="familyStatus" value={form.familyStatus ?? ''} onChange={handleField}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none">
                    <option value="">Select</option>
                    <option>Nuclear</option>
                    <option>Joint</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Father's Occupation</label>
                    <input name="fatherOccupation" value={form.fatherOccupation ?? ''} onChange={handleField}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Mother's Occupation</label>
                    <input name="motherOccupation" value={form.motherOccupation ?? ''} onChange={handleField}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Number of Siblings</label>
                  <input type="number" name="siblings" value={form.siblings ?? ''} onChange={handleField} min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Min Age Preference</label>
                    <input type="number" name="minAgePreference" value={form.minAgePreference ?? ''} onChange={handleField}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Max Age Preference</label>
                    <input type="number" name="maxAgePreference" value={form.maxAgePreference ?? ''} onChange={handleField}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Country Preference</label>
                  <input name="countryPreference" value={form.countryPreference ?? ''} onChange={handleField} placeholder="Any country"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Min Height Preference (cm)</label>
                  <input type="number" name="minHeightPreference" value={form.minHeightPreference ?? ''} onChange={handleField}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                  <p><strong>Name:</strong> {form.name}</p>
                  <p><strong>Gender:</strong> {form.gender}</p>
                  <p><strong>DOB:</strong> {form.dateOfBirth}</p>
                  {form.country && <p><strong>Country:</strong> {form.country}</p>}
                  {form.education && <p><strong>Education:</strong> {form.education}</p>}
                </div>
                <p className="text-xs text-gray-500">A bio and expectations will be auto-generated based on your profile. You can edit them after creation.</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition">
                Back
              </button>
              {step < 4 ? (
                <button onClick={() => setStep((s) => s + 1)}
                  className="px-5 py-2 bg-[#1B6B4A] text-white rounded-xl text-sm font-semibold hover:bg-[#155a3d] transition">
                  Next
                </button>
              ) : (
                <button onClick={createProfile} disabled={saving || !form.name || !form.dateOfBirth}
                  className="px-5 py-2 bg-[#1B6B4A] text-white rounded-xl text-sm font-semibold hover:bg-[#155a3d] transition disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profiles list */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">👤</p>
          <p className="font-medium">No profiles yet</p>
          <p className="text-sm mt-1">Click "Create Profile" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    p.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                    p.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{p.status}</span>
                </div>
                <p className="text-sm text-gray-500">{p.gender} · {p.country ?? 'Not specified'} · {p.education ?? 'N/A'}</p>
                {p.subscription && (
                  <p className="text-xs text-gray-400 mt-1">
                    Subscription: <span className={p.subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}>{p.subscription.status}</span>
                    {p.subscription.endDate && ` · Expires ${new Date(p.subscription.endDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {(p.status === 'DRAFT' || p.status === 'EXPIRED') && (
                  <button onClick={() => initiatePayment(p.id)}
                    className="text-xs bg-[#1B6B4A] text-white px-3 py-1.5 rounded-lg hover:bg-[#155a3d] transition">
                    {p.status === 'EXPIRED' ? 'Renew' : 'Activate'}
                  </button>
                )}
                <button onClick={() => deleteProfile(p.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
