import { Bell, Search } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Paiement sécurisé</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 dark:border-white/10 dark:bg-slate-800/80">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un paiement..."
              className="w-48 bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100 placeholder-slate-400"
              aria-label="Rechercher"
            />
          </div>
          <button
            className="relative rounded-2xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
