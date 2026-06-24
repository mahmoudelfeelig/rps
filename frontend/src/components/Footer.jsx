import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const links = [
    ['Games', '/games'],
    ['Economy', '/economy'],
    ['Market', '/market'],
    ['Store', '/store'],
    ['Privacy', '/privacy'],
    ['Cookies', '/cookies'],
  ];

  return (
    <footer role="contentinfo" className="mt-12 border-t border-white/10 bg-black/30 text-sm text-white/50 backdrop-blur-xl">
      <div className="container max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="font-black tracking-[0.22em] text-white/80">RPS</div>
            <p className="mt-1 max-w-lg leading-6">
              Short games, player economy, collections, and account systems built for quick sessions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {links.map(([label, to]) => (
              <Link key={to} to={to} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/35">
          © {new Date().getFullYear()} RPS. Game currency has no real-money value.
        </div>
      </div>
    </footer>
  );
}
