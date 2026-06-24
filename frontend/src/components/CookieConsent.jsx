import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'rps_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(STORAGE_KEY));
  }, []);

  const choose = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      value,
      updatedAt: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] md:bottom-4">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Cookies and analytics</h2>
            <p className="mt-1 text-sm leading-6 text-white/65">
              RPS uses essential cookies for login. Analytics cookies are optional and help improve balance, games, and reliability.
            </p>
            <div className="mt-2 flex gap-3 text-xs text-white/55">
              <Link to="/cookies" className="hover:text-white">Cookie Policy</Link>
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => choose('essential')}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => choose('all')}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
