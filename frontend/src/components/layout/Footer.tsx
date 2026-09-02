import { Link } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pb-6 dark:border-slate-800 dark:bg-slate-900 sm:pb-8 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
              WebPaysh
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Plateforme de paiement sécurisée avec authentification JWT et gestion des transferts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/payment" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Paiement
                </Link>
              </li>
              <li>
                <Link to="/merchant/portal" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Portail Marchand
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center sm:text-left">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center sm:text-left">
            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Contact</h4>
            <div className="flex justify-center gap-4 sm:justify-start">
              <a
                href="mailto:contact@webpaysh.com"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-cyan-600 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-cyan-600"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-6 dark:border-slate-800 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              © {currentYear} WebPaysh. Fait avec <Heart size={16} className="text-red-500" /> pour les paiements numériques.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link to="/terms" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
