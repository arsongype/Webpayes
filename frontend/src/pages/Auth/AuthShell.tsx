import { type ReactNode } from 'react';

const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.5C3 5.567 4.567 4 6.5 4H17.5C19.433 4 21 5.567 21 7.5V11H3V7.5Z" fill="currentColor" opacity="0.9" />
            <path d="M3 13H21V16.5C21 18.433 19.433 20 17.5 20H6.5C4.567 20 3 18.433 3 16.5V13Z" fill="currentColor" opacity="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight">WebPaysh</h1>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
          Paiement nouvelle génération
        </span>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-white/5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthShell;
