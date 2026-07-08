import { Link } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-4">
              WebPaysh
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Plateforme de paiement sécurisée avec authentification JWT et gestion des transferts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/transfer" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Transfert
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Portefeuille
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                  Confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Suivez-nous</h4>
            <div className="flex gap-4">
              <a
                href="mailto:contact@webpaysh.com"
                className="p-2 bg-slate-100 hover:bg-cyan-600 rounded-lg text-slate-500 hover:text-white dark:bg-slate-800 dark:hover:bg-cyan-600 dark:text-slate-400 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
              © {currentYear} WebPaysh. Fait avec <Heart size={16} className="text-red-500" /> pour les paiements numériques.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors text-sm">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
