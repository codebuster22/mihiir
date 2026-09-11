'use client';

import { useId, useRef, useState } from 'react';
import styles from './diagrams.module.css';

const steps = [
  {
    title: 'Accepted base',
    description: 'An initial book establishes the starting state.',
  },
  {
    title: 'Accepted changes',
    description: 'Changes belong to that established history.',
  },
  {
    title: 'Disagreeing snapshot',
    description: 'The new snapshot does not match the derived book.',
  },
  {
    title: 'New starting point',
    description: 'A new continuity epoch makes the break explicit.',
  },
];

export function ContinuityDiagram() {
  const [step, setStep] = useState<number | null>(null);
  const titleId = useId();
  const startButton = useRef<HTMLButtonElement>(null);
  const previousButton = useRef<HTMLButtonElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const guided = step !== null;

  function changeView(next: number | null) {
    const previousTop = controls.current?.getBoundingClientRect().top;
    setStep(next);
    requestAnimationFrame(() => {
      // On a narrow screen the full sequence is taller. Keep the controls where
      // the reader used them instead of leaving the selected explanation offscreen.
      if (previousTop !== undefined && controls.current) {
        const difference =
          controls.current.getBoundingClientRect().top - previousTop;
        if (Math.abs(difference) > 1)
          window.scrollBy({ top: difference, behavior: 'instant' });
      }
      (next === null ? startButton : previousButton).current?.focus({
        preventScroll: true,
      });
    });
  }

  return (
    <figure className={styles.continuity} aria-labelledby={titleId}>
      <figcaption id={titleId}>When a snapshot disagrees</figcaption>
      <p className={styles.exampleLabel}>Illustrative example</p>
      <svg className={styles.history} aria-hidden="true">
        <line
          x1="12.5%"
          x2="37.5%"
          y1="50%"
          y2="50%"
          className={styles.acceptedLine}
        />
        <line
          x1="40%"
          x2="60%"
          y1="50%"
          y2="50%"
          className={styles.brokenLine}
        />
        <line
          x1="65%"
          x2="85%"
          y1="50%"
          y2="50%"
          className={styles.brokenLine}
        />
        <svg x="12.5%" y="50%" width="1" height="1" overflow="visible">
          <g className={styles.historyMark} data-active={step === 0}>
            <rect x="-7" y="-7" width="14" height="14" rx="2" />
          </g>
        </svg>
        <svg x="37.5%" y="50%" width="1" height="1" overflow="visible">
          <g className={styles.historyMark} data-active={step === 1}>
            <rect x="-7" y="-7" width="14" height="14" rx="2" />
          </g>
        </svg>
        <svg x="62.5%" y="50%" width="1" height="1" overflow="visible">
          <g className={styles.historyBreak} data-active={step === 2}>
            <path d="M-6-6l12 12m0-12-12 12" />
          </g>
        </svg>
        <svg x="87.5%" y="50%" width="1" height="1" overflow="visible">
          <g className={styles.historyMark} data-active={step === 3}>
            <rect x="-11" y="-11" width="22" height="22" rx="3" />
            <rect
              x="-5"
              y="-5"
              width="10"
              height="10"
              rx="1"
              fill="currentColor"
            />
          </g>
        </svg>
      </svg>
      <div className={styles.stepViewport} data-guided={guided}>
        <ol className={styles.steps}>
          {steps.map((item, index) => (
            <li
              key={item.title}
              hidden={guided && step !== index}
              aria-current={step === index ? 'step' : undefined}
            >
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
      <div ref={controls} className={styles.controls}>
        {!guided ? (
          <button ref={startButton} type="button" onClick={() => changeView(0)}>
            Step through example
          </button>
        ) : (
          <>
            <div className={styles.stepButtons}>
              <button
                ref={previousButton}
                type="button"
                aria-disabled={step === 0}
                onClick={() => {
                  if (step > 0) setStep(step - 1);
                }}
              >
                Previous
              </button>
              <span className={styles.progress}>
                Step {step + 1} of {steps.length}
              </span>
              <button
                type="button"
                aria-disabled={step === steps.length - 1}
                onClick={() => {
                  if (step < steps.length - 1) setStep(step + 1);
                }}
              >
                Next
              </button>
            </div>
            <button
              className={styles.showAll}
              type="button"
              onClick={() => changeView(null)}
            >
              Show all steps
            </button>
          </>
        )}
      </div>
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {guided
          ? `Step ${step + 1} of 4. ${steps[step].title}. ${steps[step].description}`
          : 'All four steps are visible.'}
      </span>
    </figure>
  );
}
