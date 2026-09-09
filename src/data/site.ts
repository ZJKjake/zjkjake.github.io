export const site = {
  name: 'Jake Zhang',
  fullName: 'Jiankun (Jake) Zhang',
  role: 'B.S. Computer Science & B.A. Economics · University of Chicago',
  email: 'jiankunz@uchicago.edu',
  phone: '+1 517-316-5171',
  github: 'https://github.com/ZJKjake',
  githubHandle: 'ZJKjake',
  resume: '/media/Jiankun_Zhang_Resume_2026-09.pdf',

  tagline: 'building the systems layer under machine learning research.',

  description:
    'Jiankun (Jake) Zhang — undergraduate at the University of Chicago working on GPU simulation infrastructure, distributed reinforcement-learning training, and research tooling. Research assistant at MIT CSAIL and former humanoid reinforcement-learning intern at Agile Robots.',

  /*
   * Agile Robots internship media is company-internal work. Jake confirmed
   * clearance to publish it on 2026-09-08. Flip to false to strip it.
   */
  showCompanyMedia: true,
} as const;

export const socials = [
  { label: 'GitHub', href: site.github },
  { label: 'Email', href: `mailto:${site.email}` },
] as const;

/** In-page section nav — single-page site. */
export const nav = [
  { label: 'Industry', href: '/#industry' },
  { label: 'Research', href: '/#research' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Contact', href: '/#contact' },
] as const;
