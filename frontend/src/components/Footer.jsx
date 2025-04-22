import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0e0e0f] border-t border-dark-300 text-gray-500 text-sm py-6 px-4 mt-12">
      <div className="max-w-6xl mx-auto flex justify-center items-center text-center">
        <p>
          © {new Date().getFullYear()} Risk Paper Scammers. All scams final. 💸
        </p>
      </div>
    </footer>
  );
};

export default Footer;
