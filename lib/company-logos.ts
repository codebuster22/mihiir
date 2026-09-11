// Complete client/collaborator inventory from Chain Labs' Credibility component.
// Intrinsic dimensions preserve each asset's ratio; displayWidth is optical sizing.
export const companyLogos = [
  {
    name: 'Curve Labs',
    file: 'curve-labs.png',
    width: 563,
    height: 740,
    displayWidth: 43,
  },
  {
    name: 'Movement Labs',
    file: 'movement-labs.svg',
    width: 249,
    height: 32,
    displayWidth: 192,
  },
  {
    name: 'Safe Global',
    file: 'safe-global.svg',
    width: 63,
    height: 24,
    displayWidth: 124,
  },
  {
    name: 'Protocol Labs',
    file: 'protocol-labs.svg',
    width: 314,
    height: 82,
    displayWidth: 210,
  },
  {
    name: 'Hyperlane',
    file: 'hyperlane.svg',
    width: 842,
    height: 699,
    displayWidth: 66,
  },
  {
    name: 'Toucan Earth',
    file: 'toucan-earth.png',
    width: 1056,
    height: 350,
    displayWidth: 156,
  },
  {
    name: 'Giza',
    file: 'giza.png',
    width: 1000,
    height: 951,
    displayWidth: 62,
  },
  {
    name: 'Arbitrum',
    file: 'arbitrum.svg',
    width: 470,
    height: 514,
    displayWidth: 50,
    tonal: true,
  },
  {
    name: 'Komet Wallet',
    file: 'komet-wallet.svg',
    width: 430,
    height: 96,
    displayWidth: 156,
  },
  {
    name: 'Zo World',
    file: 'zo-world.svg',
    width: 491,
    height: 293,
    displayWidth: 76,
  },
  {
    name: 'Antigravity',
    file: 'antigravity.svg',
    width: 600,
    height: 600,
    displayWidth: 50,
    tonal: true,
  },
  {
    name: 'Bipzy',
    file: 'bipzy.svg',
    width: 209,
    height: 52,
    displayWidth: 164,
  },
] satisfies {
  name: string;
  file: string;
  width: number;
  height: number;
  displayWidth: number;
  tonal?: boolean;
}[];
