import styles from './diagrams.module.css';

const nodes = [
  { title: 'Player action', detail: 'Register, mine, enter', shape: 'input' },
  { title: 'Contracts', detail: 'Apply the game rules', shape: 'contracts' },
  { title: 'Indexed state', detail: 'Player and game data', shape: 'data' },
] as const;

function PrintedGlyph({ shape }: { shape: (typeof nodes)[number]['shape'] }) {
  const points =
    shape === 'input'
      ? [
          [8, 8],
          [12, 12],
          [16, 16],
          [20, 20],
          [12, 16],
          [12, 20],
          [16, 12],
          [20, 12],
        ]
      : shape === 'contracts'
        ? [
            [4, 8],
            [4, 12],
            [4, 16],
            [4, 20],
            [8, 4],
            [8, 24],
            [20, 4],
            [20, 24],
            [24, 8],
            [24, 12],
            [24, 16],
            [24, 20],
          ]
        : [4, 12, 20].flatMap((y) => [4, 8, 12, 16, 20].map((x) => [x, y]));
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      {points.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="2.5"
          height="2.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function GameStateDiagram() {
  return (
    <figure className={styles.gameFigure} aria-labelledby="game-state-title">
      <figcaption id="game-state-title">
        From a player action to visible game state
      </figcaption>
      <ol className={styles.gameFlow}>
        {nodes.map((node) => (
          <li key={node.title}>
            <div
              className={styles.gameNode}
              data-emphasis={node.shape === 'contracts'}
            >
              <PrintedGlyph shape={node.shape} />
              <strong>{node.title}</strong>
              <span>{node.detail}</span>
            </div>
          </li>
        ))}
      </ol>
      <p>
        Keepers trigger scheduled contract actions. The phase manager supplies
        the current journey phase.
      </p>
    </figure>
  );
}
