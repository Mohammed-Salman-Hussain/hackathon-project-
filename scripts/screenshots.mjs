// Playwright screenshot sweep: every route at 390 px (mobile) and 1440 px (desktop).
// Usage: npm run build && npm run shots -- step-01 [route ...]
// Uses the system Chrome (set CHROME_PATH to override), so no browser download is needed.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const [, , step = 'latest', ...only] = process.argv;
const PORT = 4173;
const BASE = `http://localhost:${PORT}/hackathon-project-/`;
const ALL = ['/', '/command', '/loops', '/hub-twin', '/storm', '/impact', '/replicate', '/evidence',
  '/hardware', '/security', '/sdg9', '/credits', '/leaks', '/monsoon', '/sandbox'];
const routes = only.length ? only : ALL;
const sizes = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];
const outDir = path.join('docs', 'screenshots', step);
mkdirSync(outDir, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const stop = () => server.kill();
process.on('exit', stop);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview server did not start');
}

await waitForServer();
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  channel: process.env.CHROME_PATH ? undefined : 'chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
let problems = 0;
for (const size of sizes) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.g|net::ERR|Failed to load resource/.test(m.text())) {
      problems++;
      console.error(`[console] ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => {
    problems++;
    console.error(`[pageerror] ${e.message}`);
  });
  for (const route of routes) {
    await page.goto(`${BASE}#${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) {
      problems++;
      console.error(`[overflow] ${route} @${size.width}: ${overflow}px wider than the viewport`);
    }
    const name = `${route === '/' ? 'home' : route.slice(1)}-${size.name}.png`;
    await page.screenshot({ path: path.join(outDir, name), fullPage: false });
  }
  await ctx.close();
}
await browser.close();
stop();
console.log(`${routes.length * sizes.length} screenshots in ${outDir}; ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
