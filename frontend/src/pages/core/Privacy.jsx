import React from 'react';
import { PageFrame, PageHero } from '../../components/ui/page';

export default function Privacy() {
  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_0%,rgba(244,114,182,0.12),transparent_34%),linear-gradient(180deg,#030712_0%,#09090b_55%,#020202_100%)]">
      <section className="mx-auto max-w-3xl">
        <PageHero title="Privacy" description="What account, gameplay, upload, and moderation data exists in the game." />
        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="mt-6 space-y-5 text-sm leading-7 text-white/70">
          <p>RPS stores account details, profile images, game progress, bets, trades, inventory, and moderation data needed to run the game.</p>
          <p>Uploaded images and GIFs are used for your profile and public profile surfaces. Do not upload content you do not have permission to use.</p>
          <p>Email addresses are used for login security and verification. Admin tools may expose account and gameplay data needed to support the game.</p>
        </div>
        </div>
      </section>
    </PageFrame>
  );
}
