import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1A040A] text-stone-300 py-12 border-t border-red-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-red-950/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#B81D24] flex items-center justify-center text-white">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LifeLink</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-400">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <a href="#blood-types" className="hover:text-white transition-colors">
              Eligibility guide
            </a>
          </div>
        </div>

        <div className="mt-8 text-center md:text-left text-xs text-stone-400 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>Emergency declarations are limited to verified organizations. © 2026 LifeLink</p>
          <p className="text-stone-400">
            Real-time blood supply coordination network
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
