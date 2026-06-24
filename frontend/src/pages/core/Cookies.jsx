import React from 'react';

export default function Cookies() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">Policy</p>
        <h1 className="mt-2 text-3xl font-black">Cookie Policy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-white/70">
          <p>RPS uses essential storage for authentication, session state, and security-sensitive preferences.</p>
          <p>Optional analytics cookies may be used to understand page performance, game balance, error rates, and feature usage. They should not be used to sell personal data.</p>
          <p>You can clear your choice from your browser storage at any time. If analytics are added later, they should respect the consent choice stored on this device.</p>
        </div>
      </section>
    </main>
  );
}
