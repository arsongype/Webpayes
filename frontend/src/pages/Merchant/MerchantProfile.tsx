import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import merchantService, { type MerchantProfileDTO, type MerchantProfileRequest } from '../../services/merchantService';
import { useAuth } from '../../hooks/useAuth';
import RequiredAsterisk from '../../components/common/RequiredAsterisk/RequiredAsterisk';

const MerchantProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<MerchantProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<MerchantProfileRequest>({
    shopName: '',
    description: '',
    logoUrl: '',
    phoneNumber: '',
    address: '',
    bankAccountNumber: '',
    bankName: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await merchantService.getProfile();
        if (data) {
          setProfile(data);
          setForm({
            shopName: data.shopName,
            description: data.description || '',
            logoUrl: data.logoUrl || '',
            phoneNumber: data.phoneNumber,
            address: data.address || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankName: data.bankName || '',
          });
        }
      } catch {
        setError('Impossible de charger le profil marchand.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setForm({ ...form, logoUrl: base64 });
    } catch {
      setError('Impossible de charger l\'image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await merchantService.updateProfile(form);
      setProfile(updated);
      setSuccess('Profil marchand mis à jour avec succès.');
    } catch {
      setError('Échec de la mise à jour du profil.');
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

  const statusColor = profile?.status === 'APPROVED' ? 'emerald' : profile?.status === 'REJECTED' ? 'rose' : 'amber';

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600/80 dark:text-cyan-300/80">Marchand</p>
              <h1 className="mt-2 text-3xl font-semibold">Profil marchand</h1>
            </div>
            {profile && (
              <span className={`inline-flex items-center rounded-full bg-${statusColor}-500/15 px-3 py-1 text-xs font-medium text-${statusColor}-600 dark:text-${statusColor}-300`}>
                {profile.status}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200" role="status">
              {success}
            </div>
          )}

          {!profile ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Vous n'avez pas encore de profil marchand.</p>
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                Créez votre profil pour commencer à recevoir des paiements.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom de la boutique<RequiredAsterisk hasError={touched.shopName && !form.shopName} /></label>
                  <input
                    value={form.shopName}
                    onChange={(e) => { setForm({ ...form, shopName: e.target.value }); setTouched({ ...touched, shopName: true }); }}
                    onBlur={() => setTouched({ ...touched, shopName: true })}
                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 ${touched.shopName && !form.shopName ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone<RequiredAsterisk hasError={touched.phoneNumber && !form.phoneNumber} /></label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setTouched({ ...touched, phoneNumber: true }); }}
                    onBlur={() => setTouched({ ...touched, phoneNumber: true })}
                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 ${touched.phoneNumber && !form.phoneNumber ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-white/10'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mb-2 block w-full text-sm text-slate-500 dark:text-slate-400"
                />
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="Logo preview" className="mt-2 h-24 w-24 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Numéro de compte bancaire</label>
                  <input
                    value={form.bankAccountNumber}
                    onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Banque</label>
                  <input
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-2xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Retour
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantProfile;
