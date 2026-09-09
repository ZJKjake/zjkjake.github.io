// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deploy target is configurable so the same build works on a GitHub Pages user
// site (root), a project repo (/repo-name/), or a custom domain.
// The Pages workflow sets SITE_URL and BASE_PATH from the repo it runs in.
const site = process.env.SITE_URL ?? 'https://zjkjake.github.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  output: 'static',
  // The portfolio is a single page. Keep old public links useful without
  // preserving a second set of case-study pages.
  redirects: {
    '/about': '/#profile',
    '/work': '/#projects',
    '/work/agile-robots': '/#industry',
    '/work/mit-csail': '/#research',
    '/work/respiramfm': '/#research',
    '/work/agentmeter': '/#projects',
    '/work/autoencoder-lab': '/#projects',
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
