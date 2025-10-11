import React from 'react';

export default function Footer() {
  return (
    <footer role="contentinfo" className="bg-[#0e0e0f] border-t border-dark-300 text-gray-500 text-sm mt-12">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <p className="text-center">
          © {new Date().getFullYear()} brick by brick.
        </p>
      </div>
    </footer>
  );
}
