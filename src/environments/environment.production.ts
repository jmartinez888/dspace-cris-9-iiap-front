import { BuildConfig } from '../config/build-config.interface';

export const environment: Partial<BuildConfig> = {
  production: true,

  // Angular SSR (Server Side Rendering) settings
  ssr: {
    enabled: true,
    enablePerformanceProfiler: false,
    inlineCriticalCss: false,
    transferState: true,
    replaceRestUrl: true,
    excludePathPatterns: [
      {
        pattern: '^/communities/[a-f0-9-]{36}/browse(/.*)?$',
        flag: 'i',
      },
      {
        pattern: '^/collections/[a-f0-9-]{36}/browse(/.*)?$',
        flag: 'i',
      },
      // Faceted searches have high-cardinality URLs and trigger many REST
      // calls. Rendering them in SSR lets crawlers exhaust the Node process;
      // serve the application shell and let the browser fetch search results.
      {
        pattern: '^/communities/[a-f0-9-]{36}/search$',
        flag: 'i',
      },
      {
        pattern: '^/collections/[a-f0-9-]{36}/search$',
        flag: 'i',
      },
      { pattern: '^/browse/' },
      { pattern: '^/search' },
      { pattern: '^/community-list$' },
      { pattern: '^/statistics/?' },
      { pattern: '^/admin/' },
      { pattern: '^/processes/?' },
      { pattern: '^/notifications/' },
      { pattern: '^/access-control/' },
      { pattern: '^/health$' },
    ],
    enableSearchComponent: false,
    enableBrowseComponent: false,
  },
};
