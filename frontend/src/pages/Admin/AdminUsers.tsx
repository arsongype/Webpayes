import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Pencil, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import userService from '../../services/userService';
import type { UserDTO } from '../../types/user.types';
import type { UserCreatePayload, UserUpdatePayload } from '../../services/userService';
import { USER } from '../../constants/roles.constants';

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
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-4xl border border-amber-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-amber-400/20 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-600/80 dark:text-amber-300/80">Administration</p>
              <h1 className="mt-2 text-4xl font-semibold">Utilisateurs</h1>
              <p className="mt-2 text-slate-500 dark:text-slate-300">Gérez les comptes, rôles et accès.</p>
            </div>
            <div className="flex gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-64 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
              />
              <button
                onClick={() => { setEditingId(null); setForm(emptyForm); setFormOpen(true); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
              >
                <Plus size={16} /> Nouveau
              </button>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Nom</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Rôle</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-white/10">
                    <td className="py-3 text-slate-700 dark:text-slate-200">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3 font-mono text-slate-700 dark:text-slate-200">{u.email}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => toggleEnabled(u)} className="inline-flex items-center gap-1">
                        {u.enabled ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                        <span className={u.enabled ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}>
                          {u.enabled ? 'Actif' : 'Bloqué'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(u)} className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                          <Pencil size={16} className="text-slate-700 dark:text-slate-200" />
                        </button>
                        {u.id !== me?.sub && (
                          <button onClick={() => handleDelete(u.id)} className="rounded-xl bg-red-500/10 p-2 hover:bg-red-500/20">
                            <Trash2 size={16} className="text-red-600 dark:text-red-300" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500">
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
          <div className="w-full max-w-lg rounded-4xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingId ? 'Modifier' : 'Nouvel utilisateur'}</h2>
              <button onClick={() => { setFormOpen(false); setEditingId(null); setForm(emptyForm); }} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Prénom</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Nom</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
              </div>
              {!editingId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Mot de passe</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100" />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Rôle</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' })} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input id="enabled" type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
                  <label htmlFor="enabled" className="text-sm text-slate-700 dark:text-slate-200">Actif</label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setFormOpen(false); setEditingId(null); setForm(emptyForm); }} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-800">Annuler</button>
              <button onClick={handleCreate} disabled={saving} className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60">
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
