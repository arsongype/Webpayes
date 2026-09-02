import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

interface MerchantSearchResult {
  id: string;
  shopName: string;
  description?: string;
  address?: string;
  phoneNumber: string;
  status: string;
}

const MerchantSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MerchantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/merchant-profiles/search?q=${encodeURIComponent(q)}`);
      setResults(response.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <Search className="text-cyan-500" size={28} />
            <div>
              <h1 className="text-3xl font-semibold">Rechercher un marchand</h1>
              <p className="text-slate-500 dark:text-slate-300">Trouvez un marchand par nom de boutique</p>
            </div>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom de la boutique..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400"
            />
          </div>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
              <Store className="mx-auto text-slate-400" size={40} />
              <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Aucun marchand trouve</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Essayez avec un autre terme de recherche.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-8 space-y-4">
              {results.map((merchant) => (
                <div key={merchant.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{merchant.shopName}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{merchant.description}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{merchant.address}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{merchant.phoneNumber}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                      {merchant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantSearch;
