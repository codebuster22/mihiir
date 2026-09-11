import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { PracticePage } from '@/components/practice/practice-page';

export const metadata: Metadata = pageMetadata({
  title: 'Web3 product engineering',
  description:
    'Product ownership, system architecture and engineering delivery for Web3. See how Mihiir brought together the contracts, services and teams behind Antigravity, Simplr Events and dSafe.',
  alternates: { canonical: '/web3-product-engineering' },
});

export default function Web3ProductEngineeringPage() {
  return (
    <PracticePage
      title="From the product you have in mind to the systems behind it."
      introduction="I’m Mihiir. I help Web3 teams turn product requirements into architecture and working software. I can own the build, write the core systems and lead the engineers bringing it together."
      scopeTitle="One product, many moving parts"
      scope={
        <>
          <p>
            A user’s action might cross a wallet, a contract, an indexer and an
            application before they see a result. Those parts need to agree on
            what happened, what comes next and how to recover when something
            goes wrong.
          </p>
          <p>
            I work across those boundaries. That means making the product
            behavior concrete, designing the system, assigning clear ownership
            and keeping the implementation connected as the product evolves.
          </p>
        </>
      }
      workTitle="Product work I’ve taken responsibility for"
      cases={[
        {
          name: 'Antigravity',
          subject: 'Full product and engineering ownership',
          description:
            'I owned delivery of this on-chain game: product decisions, architecture, system design and managing the engineers building it. The contracts, keepers and indexed state had to agree on the game’s phases so the application could show players what they could do next. I brought those parts through to delivery.',
          href: '/work/antigravity',
          linkLabel: 'Read about my role in Antigravity',
        },
        {
          name: 'Simplr Events',
          subject: 'A product spanning contracts and the venue',
          description:
            'A ticketing product has to handle more than a purchase. I designed the contracts for private resale, payment escrow and venue redemption, built the indexers and connected the applications to Web3. Simplr Events was a Chain Labs product supported by an Arbitrum grant; we executed an integration for Devcon.',
          href: '/work/simplr-events',
          linkLabel: 'Read the Simplr Events case study',
        },
        {
          name: 'dSafe',
          subject: 'Changing infrastructure without rebuilding the app',
          description:
            'I led the architecture and implementation of a TypeScript SDK that moved Safe transaction coordination onto Ceramic and ComposeDB. Familiar API calls gave developers a way to integrate it gradually. The SDK was published and the Safe Grants milestones completed through our engagement with Daoism Systems.',
          href: '/work/dsafe',
          linkLabel: 'Read the dSafe case study',
        },
      ]}
      method="We begin with the product behavior, the constraints and the people already building it. I turn that into a scope we can work through: what I own, what your team owns and where the pieces meet. Architecture and delivery planning happen together, with decisions explained as the work progresses."
      questions={[
        {
          question: 'Can you take ownership of the whole build?',
          answer:
            'Yes. Antigravity is an example of that responsibility, from product decisions and architecture to managing engineers and delivery. We would define the team, scope and milestones around what your project needs.',
        },
        {
          question: 'What if our team only needs help with one part?',
          answer:
            'We can define a focused workstream inside the existing product. I can take responsibility for its architecture and implementation, including the integration and handover to your engineers.',
          href: '/solidity-engineer',
          linkLabel: 'Explore contract engineering',
        },
      ]}
      closeTitle="Let’s talk about the product you want to build."
    />
  );
}
