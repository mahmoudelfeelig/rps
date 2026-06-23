import React from 'react';

export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-12 border-t border-white/10 bg-black/30 backdrop-blur-xl text-sm text-white/50">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-center tracking-wide">
          © {new Date().getFullYear()} RPS.
        </p>
      </div>
    </footer>
  );
}
