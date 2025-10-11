import React from 'react';
import { Outlet } from 'react-router-dom';

export default function PageShell() {
  return (
    <main id="main" className="main-content">
      <div className="container px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  );
}
