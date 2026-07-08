const Loader = ({ label = 'Chargement...' }: { label?: string }) => {
  return (
    <div className="flex items-center justify-center gap-3" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
};

export default Loader;
