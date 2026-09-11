# Company logo inventory

The strip uses all 12 entries in `chain-labs-recruiting-landing-page/src/components/Credibility.tsx`: Curve Labs, Movement Labs, Safe Global, Protocol Labs, Hyperlane, Toucan Earth, Giza, Arbitrum, Komet Wallet, Zo World, Antigravity and Bipzy. The original five-logo subset omitted seven available assets.

`lib/company-logos.ts` records the intrinsic dimensions and optical display widths. All source logos are preserved; `public/brands` supplies the website. Dark-background wordmarks become black through CSS. Antigravity and Arbitrum use grayscale so their internal light/dark details remain visible rather than collapsing to a solid silhouette.

The desktop loop uses two identical sets, each at least one viewport wide, so very wide screens never expose an empty tail. Hover, keyboard focus and scrolling the strip out of view pause the loop. Touch devices and reduced-motion preferences use a single, static, horizontally scrollable set. There is no pause button or accompanying role copy.
