import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Pencil, Trash2, X, CheckCircle, XCircle, Download } from 'lucide-react';
import userService from '../../services/userService';
import type { UserDTO } from '../../types/user.types';
import type { UserCreatePayload, UserUpdatePayload } from '../../services/userService';
import { USER } from '../../constants/roles.constants';
import { exportTableToPdf } from '../../utils/exportPdf';

type FormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
};

const emptyForm: FormPayload = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: USER,
  enabled: true,
};

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormPayload>(emptyForm);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await userService.list();
      setUsers(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const handleCreate = async () => {
    if (!form.email || !form.firstName || !form.lastName) return;
    if (!editingId && !form.password) return;
    setSaving(true);
    try {
      if (editingId) {
        const payload: UserUpdatePayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          enabled: form.enabled,
        };
        if (form.password) payload.password = form.password;
        await userService.update(editingId, payload);
      } else {
        const payload: UserCreatePayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password!,
          role: form.role,
          enabled: form.enabled,
        };
        await userService.create(payload);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (u: UserDTO) => {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',
      role: u.role as 'USER' | 'ADMIN',
      enabled: u.enabled,
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await userService.delete(id);
      refresh();
    } catch {
      // ignore
    }
  };

  const toggleEnabled = async (u: UserDTO) => {
    try {
      await userService.update(u.id, { enabled: !u.enabled });
      refresh();
    } catch {
      // ignore
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Administration</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Utilisateurs</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Gérez les comptes, rôles et accès.</p>
          </div>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-64 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
            />
              <button
                onClick={() => {
                  exportTableToPdf({
                    title: 'Liste des utilisateurs',
                    subtitle: `Exporté le ${new Date().toLocaleString('fr-FR')}`,
                    columns: [
                      { key: 'name', label: 'Nom' },
                      { key: 'email', label: 'Email' },
                      { key: 'role', label: 'Rôle' },
                      { key: 'status', label: 'Statut' },
                    ],
                    rows: filtered.map((u) => ({
                      name: `${u.firstName} ${u.lastName}`,
                      email: u.email,
                      role: u.role,
                      status: u.enabled ? 'Actif' : 'Bloqué',
                    })),
                  });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={() => { setEditingId(null); setForm(emptyForm); setFormOpen(true); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                <Plus size={16} /> Nouveau
              </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/5 dark:bg-slate-800/40">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nom</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rôle</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700 dark:text-slate-200">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">{u.email}</td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <button onClick={() => toggleEnabled(u)} className="inline-flex items-center gap-1.5 text-xs font-medium">
                        {u.enabled ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                        <span className={u.enabled ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}>
                          {u.enabled ? 'Actif' : 'Bloqué'}
                        </span>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(u)} className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                          <Pencil size={16} className="text-slate-700 dark:text-slate-200" />
                        </button>
                        {u.id !== me?.sub && (
                          <button onClick={() => handleDelete(u.id)} className="rounded-xl bg-rose-500/10 p-2 transition hover:bg-rose-500/20">
                            <Trash2 size={16} className="text-rose-600 dark:text-rose-300" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editingId ? 'Modifier' : 'Nouvel utilisateur'}</h2>
              <button onClick={() => { setFormOpen(false); setEditingId(null); setForm(emptyForm); }} className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Prénom</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
              </div>
              {!editingId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Rôle</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input id="enabled" type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
                  <label htmlFor="enabled" className="text-sm text-slate-700 dark:text-slate-200">Actif</label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setFormOpen(false); setEditingId(null); setForm(emptyForm); }} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">Annuler</button>
              <button onClick={handleCreate} disabled={saving} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
