/**
 * Reports which elements are wider than the viewport, for a given page of the
 * local `preview/` build. Diagnostic only — not part of the site build.
 *
 *   node scripts/measure-overflow.mjs work/agile-robots 414
 */
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const page = process.argv[2] ?? '';
const width = Number(process.argv[3] ?? 414);

const root = new URL('../preview/', import.meta.url);
const source = new URL(`${page ? `${page}/` : ''}index.html`, root);
const probe = new URL('_overflow-probe.html', root);

const probeScript = `
<script>
  window.addEventListener('load', () => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1 || r.right > vw + 1) {
        // Only report the element itself, not every ancestor that inherits it.
        if (![...el.children].some((c) => {
          const cr = c.getBoundingClientRect();
          return cr.width > vw + 1 || cr.right > vw + 1;
        })) {
          offenders.push(
            el.tagName.toLowerCase() +
              (el.className && typeof el.className === 'string'
                ? '.' + el.className.trim().split(/\\s+/).slice(0, 4).join('.')
                : '') +
              '  w=' + Math.round(r.width) + ' right=' + Math.round(r.right),
          );
        }
      }
    }
    document.body.textContent =
      'viewport=' + vw +
      ' scrollWidth=' + document.documentElement.scrollWidth +
      '\\nOFFENDERS(' + offenders.length + '):\\n' + offenders.join('\\n');
  });
</script>
`;

const html = await readFile(source, 'utf8');
await writeFile(probe, html.replace('</body>', `${probeScript}</body>`));

try {
  const { stdout } = await run(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--window-size=${width},1200`,
    '--virtual-time-budget=4000',
    '--dump-dom',
    probe.href,
  ]);

  const body = stdout.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  console.log(
    (body?.[1] ?? stdout)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim(),
  );
} finally {
  await unlink(probe);
}
