import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2 } from 'lucide-react';

const highlights = [
  {
    icon: Shield,
    title: 'Chiffrement',
    text: 'Toutes les communications sont protegees par TLS.',
  },
  {
    icon: Lock,
    title: 'Authentification',
    text: 'Acces securise par JWT et mot de passe hashe.',
  },
  {
    icon: Eye,
    title: 'Surveillance',
    text: 'Detection continue de fraude et d\'anomalies.',
  },
  {
    icon: Trash2,
    title: 'Suppression',
    text: 'Vous pouvez demander la suppression de votre compte et de vos donnees.',
  },
];

const sections = [
  {
    title: 'Donnees collectees',
    body: "Nous collectons vos nom, prenom, email, numero de telephone, les donnees de transaction, les donnees techniques comme l'adresse IP et les logs, ainsi que les documents KYC.",
  },
  {
    title: 'Utilisation des donnees',
    body: "Vos donnees servent a fournir et ameliorer le service, prevenir la fraude, vous envoyer des notifications importantes et respecter nos obligations legales.",
  },
  {
    title: 'Partage des donnees',
    body: "Nous ne vendons jamais vos donnees. Elles peuvent etre partagees avec des prestataires comme les operateurs mobile money ou les services KYC. Nous pouvons aussi divulguer des informations si la loi l'exige.",
  },
  {
    title: 'Conservation des donnees',
    body: "Vos donnees sont conservees pendant la duree necessaire au service, conformement aux exigences legales. Vous pouvez demander leur suppression a tout moment.",
  },
  {
    title: 'Vos droits',
    body: "Vous avez le droit d'acceder a vos donnees, de les corriger, de demander leur suppression et de vous opposer a certains traitements.",
  },
  {
    title: 'Cookies',
    body: "Nous utilisons des cookies pour ameliorer votre experience et analyser le trafic. Vous pouvez les desactiver dans votre navigateur.",
  },
  {
    title: 'Contact',
    body: "Pour toute question sur la confidentialite, contactez notre DPO a privacy@webpaysh.com.",
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-3xl font-semibold">Politique de confidentialite</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Derniere mise a jour : 1er aout 2026</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <Icon className="text-cyan-600 dark:text-cyan-400" size={24} />
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((item) => (
            <section key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
