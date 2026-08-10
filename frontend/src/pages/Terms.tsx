import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: 'Acceptation des conditions',
    body: "En utilisant WebPaysh, vous acceptez ces conditions. Si vous n'etes pas d'accord, merci de ne pas utiliser le service.",
  },
  {
    title: 'Description du service',
    body: "WebPaysh est une plateforme de paiement en ligne. Elle permet d'envoyer et de recevoir de l'argent, de gerer un portefeuille, de generer et scanner des QR codes, et d'acceder a des services financiers complementaires.",
  },
  {
    title: 'Inscription et compte',
    body: "Vous devez avoir au moins 18 ans. Vous etes responsable de vos identifiants. Toute activite sous votre compte est de votre responsabilite. Nous pouvons suspendre un compte en cas d'utilisation frauduleuse.",
  },
  {
    title: 'Transactions',
    body: "Toutes les transactions sont verifiees par nos systemes de detection de fraude. Les montants confirmes ne peuvent pas etre annules. Les frais sont affiches avant confirmation.",
  },
  {
    title: 'Confidentialite et donnees',
    body: "Vos donnees sont protegees selon notre Politique de confidentialite. Nous utilisons des mesures de securite pour proteger vos informations.",
  },
  {
    title: 'Limitation de responsabilite',
    body: "WebPaysh ne peut etre tenu responsable des pertes indirectes liees a l'utilisation du service. Nous ne garantissons pas une disponibilite ininterrompue.",
  },
  {
    title: 'Modification des conditions',
    body: "Nous pouvons modifier ces conditions a tout moment. Les changements importants sont communiques aux utilisateurs. L'utilisation continue vaut acceptation des nouvelles conditions.",
  },
  {
    title: 'Contact',
    body: "Pour toute question, contactez-nous a legal@webpaysh.com.",
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-3xl font-semibold">Conditions d'utilisation</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Derniere mise a jour : 1er aout 2026</p>

        <div className="mt-8 space-y-6">
          {sections.map((item, index) => (
            <section key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {index + 1}. {item.title}
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Terms;
