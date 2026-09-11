import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { PracticePage } from '@/components/practice/practice-page';

export const metadata: Metadata = pageMetadata({
  title: 'Solidity engineer',
  description:
    'Solidity architecture, implementation, testing and deployment tooling. Explore Mihiir’s engineering work on Supermigrate, Toucan’s cross-chain bridge and Bipzy.',
  alternates: { canonical: '/solidity-engineer' },
});

export default function SolidityEngineerPage() {
  return (
    <PracticePage
      title="I turn product rules into Solidity contracts you can build on."
      introduction="I’m Mihiir. I work on contract architecture, implementation and the tests and tooling around it. My work spans token launches, cross-chain messaging, DeFi accounting and the contract systems behind Web3 products."
      scopeTitle="The rules, and what happens at their edges"
      scope={
        <>
          <p>
            A contract can execute correctly and still do the wrong thing for
            the product. Fees can make a round trip profitable. A repeated
            message can mint twice. A lifecycle transition can happen before the
            product is ready for it.
          </p>
          <p>
            I work through those behaviors with your team, then carry the
            contract scope through implementation, testing and deployment
            tooling. Review findings become concrete changes and tests that can
            catch the same failure again.
          </p>
        </>
      }
      workTitle="Contract engineering in practice"
      cases={[
        {
          name: 'Supermigrate / Launchbox',
          subject: 'Pricing, accounting and lifecycle rules',
          description:
            'I led the contract work, built the Launchbox token, factory and exchange, and co-authored the migration contracts. When review exposed a profitable immediate buy-and-sell round trip, I changed the fee and reserve accounting and added a test for that behavior. I also restricted liquidity creation until the sale had ended.',
          href: '/work/supermigrate',
          linkLabel: 'Read the Supermigrate case study',
        },
        {
          name: 'Toucan Protocol',
          subject: 'Cross-chain messages and replay handling',
          description:
            'I was the primary engineer for Toucan’s carbon-token bridge, authoring the messenger contracts, tests and operational tooling. Each transfer had an identifiable request so the destination could reject a message it had already processed. I also carried the bridge through a transport migration while preserving its external behavior.',
          href: '/work/toucan',
          linkLabel: 'Read the Toucan bridge case study',
        },
        {
          name: 'Bipzy',
          subject: 'Launch rules, upgradeability and test quality',
          description:
            'I led smart-contract development across tiered presales, vesting, NFTs and staking, with a dedicated staking subgraph for the application. The fundraising module included an upgrade path. Mutation testing and mainnet fork tests helped examine whether the test suite could catch mistakes in the pool and NFT contracts.',
          href: '/work/bipzy',
          linkLabel: 'Read the Bipzy case study',
        },
      ]}
      methodTitle="A defined contract workstream"
      method="We start with the product rules and existing code, including the assumptions around permissions, accounting and state changes. Together, we define the contract scope, its integration points and how we’ll validate it. I can work alongside your engineers and reviewers, carrying findings through fixes and regression tests."
      questions={[
        {
          question: 'Can you work within an existing protocol?',
          answer:
            'Yes. At Toucan, I built the bridge subsystem inside the existing protocol and collaborated with its engineers through implementation and review. The scope included storage, deployment configuration and documentation as well as the contracts.',
        },
        {
          question: 'Does your scope include the application’s data needs?',
          answer:
            'It can. A contract is often only one part of the feature. On Bipzy, I built the staking subgraph so the application could query the state it needed. We can define the indexing and integration work alongside the contracts.',
          href: '/web3-product-engineering',
          linkLabel: 'Explore broader Web3 product work',
        },
      ]}
      closeTitle="Tell me about your contract workstream."
    />
  );
}
