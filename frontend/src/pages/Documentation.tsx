import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Smartphone, QrCode, MessageSquare, Code, Wallet } from 'lucide-react';

const features = [
  {
    title: 'Creation de compte',
    description: "Inscription rapide avec email ou Google. L'authentification utilise un token JWT pour sécuriser vos accès.",
    icon: BookOpen,
  },
  {
    title: 'Portefeuille',
    description: "Consultez votre solde, ajoutez ou retirez des fonds et suivez l'historique de vos opérations.",
    icon: Wallet,
  },
  {
    title: 'Transferts',
    description: "Envoyez de l'argent vers d'autres utilisateurs ou vers des opérateurs mobile money. Chaque transfert est vérifié automatiquement.",
    icon: Smartphone,
  },
  {
    title: 'QR Code',
    description: "Générez un QR Code de paiement, téléchargez-le en PDF ou scannez-en un pour valider une transaction.",
    icon: QrCode,
  },
  {
    title: 'Assistant financier',
    description: "Posez vos questions sur le budget, l'épargne ou les produits bancaires. L'assistant répond en français.",
    icon: MessageSquare,
  },
  {
    title: 'API',
    description: "Les développeurs peuvent consulter la documentation API directement sur /swagger-ui.html.",
    icon: Code,
  },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-3xl font-semibold">Documentation</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Guide rapide pour utiliser WebPaysh au quotidien.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <Icon className="text-cyan-600 dark:text-cyan-400" size={28} />
                <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
