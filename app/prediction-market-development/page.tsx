import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { PracticePage } from '@/components/practice/practice-page';

export const metadata: Metadata = pageMetadata({
  title: 'Prediction Markets development',
  description:
    'Market data, trading infrastructure and smart contracts for Prediction Markets. Explore Mihiir’s work on Titus Intelligence, pm-ws, Titus and Oracl.',
  alternates: { canonical: '/prediction-market-development' },
});

export default function PredictionMarketDevelopmentPage() {
  return (
    <PracticePage
      title="I build the systems behind products for Prediction Markets."
      introduction="I’m Mihiir. I build market data, trading infrastructure and smart contracts for teams building aggregators, analytics tools and new products for Prediction Markets. I work with your engineers to turn product requirements into systems they can build on and operate."
      scopeTitle="Where I can help"
      scope={
        <p>
          A historical indexer needs to explain what happened to a position. A
          live feed needs to tell its readers when their view is stale. An
          execution service needs to know which actions it can safely take next.
          I can design and build those parts with your team, including how they
          connect to the contracts and the application.
        </p>
      }
      workTitle="Work in Prediction Markets"
      cases={[
        {
          name: 'Titus Intelligence',
          subject: 'Historical data',
          description:
            'An indexer needs a reliable place to resume after interruption. In Titus Intelligence, recovery checkpoints advance only after enriched events are durably stored in ClickHouse. I own the product and architecture of this Polymarket ingestion system. The backfill has run; validation and certification of fresh data are in progress.',
          href: '/work/titus-intelligence',
          linkLabel: 'Read the Titus Intelligence case study',
        },
        {
          name: 'pm-ws',
          subject: 'Real-time order books',
          description:
            'I built pm-ws so applications can share order books without each managing its own feed connections. The Rust daemon gives Python and TypeScript readers explicit signals when their history breaks, so they know when to reattach to the current book. Limitless is the first implemented venue; the MIT-licensed project is preparing for public release.',
          href: '/work/pm-ws',
          linkLabel: 'Read the pm-ws case study',
        },
        {
          name: 'Titus',
          subject: 'Execution and operation',
          description:
            'I built a trading framework that lets strategies request trades without holding the signing keys. A separate executor checks balances and handles execution, with exact money types and operator controls for running the system. The framework supported live strategies and a client deployment.',
          href: '/work/titus',
          linkLabel: 'Read the Titus case study',
        },
      ]}
      method="We start with what needs to ship, the system you already have and where your team needs help. Together, we define the part I’ll own, how it connects to the rest of the product and how we’ll check that it works. As we build, I explain the decisions and tradeoffs so you can follow the work."
      questions={[
        {
          question: 'Can you work with our existing engineers?',
          answer:
            'Yes. We can define a workstream within your team, with clear ownership and integration points.',
          href: '/work/antigravity',
          linkLabel: 'Read the Antigravity case study',
        },
        {
          question: 'Can you help with a new protocol for Prediction Markets?',
          answer:
            'Yes, from product mechanics into contract architecture and a testable prototype. For Oracl, I designed the protocol prototype and built the investor demo. We’d establish the validation and review needed for your intended deployment as part of the scope.',
          href: '/work/oracl',
          linkLabel: 'Explore Oracl',
        },
      ]}
      closeTitle="Tell me what you’re building."
    />
  );
}
