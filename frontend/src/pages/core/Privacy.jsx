import React from 'react';

export default function Privacy() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">Policy</p>
        <h1 className="mt-2 text-3xl font-black">Privacy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-white/70">
          <p>RPS stores account details, profile images, game progress, bets, trades, inventory, and moderation data needed to run the game.</p>
          <p>Uploaded images and GIFs are used for your profile and public profile surfaces. Do not upload content you do not have permission to use.</p>
          <p>Email addresses are used for login security and verification. Admin tools may expose account and gameplay data needed to support the game.</p>
        </div>
      </section>
    </main>
  );
}
