import { useState } from 'react';

/**
 * Parallel-environment scale across the two robotics roles.
 *
 * Every rung is a run that was actually launched. Bar length is log-scaled for
 * the same reason as the throughput chart — 32,768 is 128x the smallest rung.
 */

type Rung = {
  envs: number;
  gpus: number;
  org: string;
  what: string;
  detail: string;
};

const RUNGS: Rung[] = [
  {
    envs: 256,
    gpus: 1,
    org: 'MIT CSAIL',
    what: 'RSP benchmark baseline',
    detail:
      'Starting configuration for the Robot Skill Puzzles benchmark harness, running InterMimic and SONIC environments inside NVIDIA Isaac Lab.',
  },
  {
    envs: 1024,
    gpus: 1,
    org: 'MIT CSAIL',
    what: 'RSP benchmark, scaled',
    detail:
      'Scaled the same harness 4x while keeping evaluation reproducible across seeds, with checkpointing and multi-seed aggregation handled by the surrounding Python/Bash infrastructure.',
  },
  {
    envs: 4096,
    gpus: 1,
    org: 'Agile Robots',
    what: 'Single-GPU smoke test',
    detail:
      'The configuration used to catch the per-environment observation bottleneck. Throughput went from ~275 to 25,155 steps/s once the offending query was batched.',
  },
  {
    envs: 8192,
    gpus: 2,
    org: 'Agile Robots',
    what: 'Distributed PPO',
    detail:
      'Two-GPU distributed PPO with four-step gradient accumulation, giving a 196,608-sample effective global batch. Sustained 73,637 steps/s at iteration 2,789.',
  },
  {
    envs: 32768,
    gpus: 4,
    org: 'Agile Robots',
    what: 'Largest run launched',
    detail:
      'Fall-recovery training across four GPUs and 32,768 parallel environments, with a wider [2048, 1024, 512] policy. Healthy at iteration 2,240 — explained variance 0.987, ~12 GB/GPU — but stopped early, so this is a scale result rather than a policy-quality one.',
  },
];

const MIN = 128;
const MAX = 32768;

function fraction(envs: number) {
  const lo = Math.log2(MIN);
  const hi = Math.log2(MAX);
  return (Math.log2(envs) - lo) / (hi - lo);
}

export default function ScalingLadder() {
  const [active, setActive] = useState(RUNGS.length - 1);
  const current = RUNGS[active];

  return (
    <div className="border border-[var(--line)] p-5 sm:p-7">
      <p className="eyebrow mb-6">Parallel simulation environments · select a run</p>

      <div className="space-y-1.5">
        {RUNGS.map((rung, i) => {
          const selected = i === active;
          return (
            <button
              key={`${rung.org}-${rung.envs}`}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-pressed={selected}
              className="group grid w-full grid-cols-[4.5rem_1fr] items-center gap-3 text-left sm:grid-cols-[5.5rem_1fr] sm:gap-4"
            >
              <span
                className="num text-right text-[0.8125rem] transition-colors"
                style={{ color: selected ? 'var(--fg)' : 'var(--fg-muted)' }}
              >
                {rung.envs.toLocaleString()}
              </span>

              <span className="relative flex h-8 items-center">
                <span
                  className="h-full transition-[background-color,width] duration-500 ease-out"
                  style={{
                    width: `${fraction(rung.envs) * 100}%`,
                    backgroundColor: selected ? 'var(--fg-accent)' : 'var(--line)',
                  }}
                />
                <span
                  className="num ml-2.5 shrink-0 text-[0.6875rem] transition-colors"
                  style={{ color: selected ? 'var(--fg)' : 'var(--fg-muted)' }}
                >
                  {rung.gpus} GPU{rung.gpus > 1 ? 's' : ''}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 border-t border-[var(--line)] pt-5">
        <p className="eyebrow mb-2">
          {current.org} · {current.what}
        </p>
        <p className="text-[0.875rem] leading-relaxed text-[var(--fg-muted)]">{current.detail}</p>
      </div>
    </div>
  );
}
