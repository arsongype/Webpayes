import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Comment créer un compte ?',
    answer: "Cliquez sur S'inscrire, entrez votre email et un mot de passe. Vous pouvez aussi vous connecter avec Google.",
  },
  {
    question: 'Comment effectuer un transfert ?',
    answer: "Ouvrez Transfert, choisissez le destinataire, indiquez le montant et confirmez. L'opération est sécurisée et tracée.",
  },
  {
    question: 'Que faire en cas de transaction suspecte ?',
    answer: "Contactez le support immédiatement. Nos services analysent chaque transaction en temps réel pour protéger votre compte.",
  },
  {
    question: 'Comment vérifier mon identité ?',
    answer: "Rendez-vous dans Assistant puis Verification KYC. Suivez les étapes et envoyez votre document d'identite.",
  },
];

const contacts = [
  { icon: Mail, label: 'Email', value: 'support@webpaysh.com' },
  { icon: Phone, label: 'Telephone', value: '+261 34 00 000 00' },
  { icon: MessageCircle, label: 'Chat', value: 'Lundi au vendredi, 9h-17h' },
];

const Support = () => {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-3xl font-semibold">Support</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Une question ? Un probleme ? On vous repond rapidement.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {contacts.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <Icon className="text-cyan-600 dark:text-cyan-400" size={24} />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.question}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Signaler un probleme</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Envoyez-nous un message a <strong>support@webpaysh.com</strong> avec une description, les etapes pour reproduire le bug et votre identifiant utilisateur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
