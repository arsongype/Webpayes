import { useEffect, useState } from 'react';
import billingService, { type BillingInfoDTO, type BillingInfoRequest } from '../../services/billingService';

import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';

const BillingInfo = () => {
  const [info, setInfo] = useState<BillingInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<BillingInfoRequest>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    taxId: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const data = await billingService.get();
      if (data) {
        setInfo(data);
        setForm({
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          taxId: data.taxId || '',
        });
      }
    } catch {
      setError('Impossible de charger les informations de facturation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = info ? await billingService.update(form) : await billingService.create(form);
      setInfo(updated);
      setSuccess('Informations de facturation enregistrées.');
    } catch {
      setError('Échec de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Profil</p>
          <h1 className="mt-2 text-3xl font-semibold">Informations de facturation</h1>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
              {success}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet<RequiredAsterisk hasError={touched.fullName && !form.fullName} /></label>
              <input value={form.fullName} onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setTouched({ ...touched, fullName: true }); }} onBlur={() => setTouched({ ...touched, fullName: true })} className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 ${touched.fullName && !form.fullName ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse<RequiredAsterisk hasError={touched.address && !form.address} /></label>
              <input value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }); setTouched({ ...touched, address: true }); }} onBlur={() => setTouched({ ...touched, address: true })} className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 ${touched.address && !form.address ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`} required />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Ville<RequiredAsterisk hasError={touched.city && !form.city} /></label>
                <input value={form.city} onChange={(e) => { setForm({ ...form, city: e.target.value }); setTouched({ ...touched, city: true }); }} onBlur={() => setTouched({ ...touched, city: true })} className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 ${touched.city && !form.city ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Code postal<RequiredAsterisk hasError={touched.postalCode && !form.postalCode} /></label>
                <input value={form.postalCode} onChange={(e) => { setForm({ ...form, postalCode: e.target.value }); setTouched({ ...touched, postalCode: true }); }} onBlur={() => setTouched({ ...touched, postalCode: true })} className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 ${touched.postalCode && !form.postalCode ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`} required />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Pays<RequiredAsterisk hasError={touched.country && !form.country} /></label>
                <input value={form.country} onChange={(e) => { setForm({ ...form, country: e.target.value }); setTouched({ ...touched, country: true }); }} onBlur={() => setTouched({ ...touched, country: true })} className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 ${touched.country && !form.country ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Identifiant fiscal (optionnel)</label>
                <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BillingInfo;



