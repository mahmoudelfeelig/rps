import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-12 border-t border-white/10 bg-black/30 backdrop-blur-xl text-sm text-white/50">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="tracking-wide">© {new Date().getFullYear()} RPS.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
