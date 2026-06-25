import React from 'react';
import { PageFrame, PageHero } from '../../components/ui/page';

export default function Cookies() {
  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,#030712_0%,#09090b_55%,#020202_100%)]">
      <section className="mx-auto max-w-3xl">
        <PageHero title="Cookie Policy" description="How local storage and analytics choices are handled." />
        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="mt-6 space-y-5 text-sm leading-7 text-white/70">
          <p>RPS uses essential storage for authentication, session state, and security-sensitive preferences.</p>
          <p>Optional analytics cookies may be used to understand page performance, game balance, error rates, and feature usage. They should not be used to sell personal data.</p>
          <p>You can clear your choice from your browser storage at any time. If analytics are added later, they should respect the consent choice stored on this device.</p>
        </div>
        </div>
      </section>
    </PageFrame>
  );
}
