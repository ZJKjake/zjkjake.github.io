import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Before/after simulation throughput on a log scale.
 *
 * A linear axis is unusable here: the fast readings are ~100x the slow one, so
 * the baseline bar would be a single pixel. Log10 keeps every bar legible and
 * is labelled as such so the comparison is not misleading.
 */

type Reading = {
  label: string;
  detail: string;
  value: number;
  /** Highlighted bars are the two numbers quoted on the résumé. */
  emphasis?: boolean;
};

const READINGS: Reading[] = [
  {
    label: 'Baseline',
    detail: 'Nested Python loops over envs × bodies · ~355 s to collect one iteration',
    value: 275,
    emphasis: true,
  },
  {
    label: 'After batching',
    detail: 'Single batched tensor gather · iteration 0 · 3.386 s to collect',
    value: 25155,
    emphasis: true,
  },
  {
    label: 'After batching',
    detail: 'Same run, iteration 1 · 2.902 s to collect',
    value: 28712,
    emphasis: true,
  },
  {
    label: 'Scaled out',
    detail: 'Sustained · 8,192 envs, 2 GPUs · iteration 2,789',
    value: 73637,
  },
];

const MIN = 100;
const MAX = 100_000;

function logFraction(value: number) {
  const lo = Math.log10(MIN);
  const hi = Math.log10(MAX);
  return (Math.log10(value) - lo) / (hi - lo);
}

const TICKS = [100, 1_000, 10_000, 100_000];

function formatTick(value: number) {
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

/** Counts up to `target` once the chart scrolls into view. */
function useCountUp(target: number, run: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast start, settles onto the exact figure
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, duration]);

  return run ? value : 0;
}

function Bar({ reading, run, index }: { reading: Reading; run: boolean; index: number }) {
  const animated = useCountUp(reading.value, run, 900 + index * 120);
  const width = run ? `${logFraction(reading.value) * 100}%` : '0%';

  return (
    <div className="grid grid-cols-[1fr] gap-2 sm:grid-cols-[13rem_1fr] sm:gap-5 sm:items-center">
      <div className="sm:text-right">
        <p className="text-[0.8125rem] leading-tight text-[var(--fg)]">{reading.label}</p>
        <p className="mt-1 text-[0.6875rem] leading-snug text-[var(--fg-muted)]">
          {reading.detail}
        </p>
      </div>

      <div className="relative h-9">
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-end pr-2.5"
          style={{
            width,
            backgroundColor: reading.emphasis ? 'var(--fg-accent)' : 'var(--line-strong)',
            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${index * 120}ms`,
          }}
        >
          <span
            className="num text-[0.8125rem] tabular-nums"
            style={{ color: reading.emphasis ? 'var(--bg)' : 'var(--fg)' }}
          >
            {Math.round(animated).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ThroughputChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setRun(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /*
   * Reported as a range, not a single figure. The two post-fix readings give
   * 91.5x and 104.4x against the same baseline, so quoting either alone would
   * be picking a favourable number.
   */
  const range = useMemo(() => {
    const base = READINGS[0].value;
    const lo = Math.round(READINGS[1].value / base);
    const hi = Math.round(READINGS[2].value / base);
    return `${lo}–${hi}×`;
  }, []);

  return (
    <div ref={ref} className="border border-[var(--line)] p-5 sm:p-7">
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow">Simulation throughput · steps/s</p>
        <p className="text-[0.75rem] text-[var(--fg-muted)]">
          <span className="num">{range}</span> across the two post-fix readings · log scale
        </p>
      </div>

      <div className="space-y-4">
        {READINGS.map((reading, i) => (
          <Bar key={`${reading.label}-${i}`} reading={reading} run={run} index={i} />
        ))}
      </div>

      <div className="mt-7 sm:pl-[14.25rem]">
        <div className="relative h-5 border-t border-[var(--line)]">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="num absolute top-1.5 -translate-x-1/2 text-[0.625rem] text-[var(--fg-muted)]"
              style={{ left: `${logFraction(tick) * 100}%` }}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 text-[0.75rem] leading-relaxed text-[var(--fg-muted)]">
        Axis is base-10 logarithmic, because a linear axis would render the baseline as a single
        pixel. The baseline and both post-fix readings come from the same 4,096-environment
        single-GPU smoke test; the 73,637 figure is a separate sustained 8,192-environment run on
        two GPUs and is not part of the before/after pair.
      </p>
    </div>
  );
}
