import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'

const footerLinks = {
  shop: {
    title: 'Boutique',
    links: [
      { label: 'Nouveautés', to: '/shop?sort=newest' },
      { label: 'Promotions', to: '/shop?sort=price_desc' },
      { label: 'Meilleures ventes', to: '/shop' },
      { label: 'Toutes les catégories', to: '/shop' },
    ],
  },
  help: {
    title: 'Aide',
    links: [
      { label: 'Service client', to: '/contact' },
      { label: 'Livraison', to: '/contact' },
      { label: 'Retours', to: '/contact' },
      { label: 'FAQ', to: '/contact' },
    ],
  },
  about: {
    title: 'À propos',
    links: [
      { label: 'Notre histoire', to: '/about' },
      { label: 'Carrières', to: '/about' },
      { label: 'Blog', to: '/about' },
      { label: 'Presse', to: '/about' },
    ],
  },
}

const socialLinks = [
  { icon: FiFacebook, href: '#', label: 'Facebook' },
  { icon: FiTwitter, href: '#', label: 'Twitter' },
  { icon: FiInstagram, href: '#', label: 'Instagram' },
  { icon: FiYoutube, href: '#', label: 'YouTube' },
]

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <h2 className="text-2xl font-display font-bold text-white">
                Shop<span className="text-primary-400">Ease</span>
              </h2>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Votre destination shopping en ligne avec des milliers de produits sélectionnés pour vous.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">123 Avenue du Commerce, 75001 Paris</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-primary-400 shrink-0" />
                <span className="text-sm">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-primary-400 shrink-0" />
                <span className="text-sm">contact@shopease.fr</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2026 ShopEase. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer