const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

function withTailwindPostcss(webpackConfig) {
  // CRA doesn't read `postcss.config.js` by default; inject Tailwind into the
  // postcss-loader pipeline explicitly so `@tailwind ...` directives compile.
  const rulesWithOneOf = webpackConfig?.module?.rules?.find((r) => Array.isArray(r.oneOf));
  const oneOf = rulesWithOneOf?.oneOf;
  if (!oneOf) return webpackConfig;

  for (const rule of oneOf) {
    const uses = rule.use;
    if (!Array.isArray(uses)) continue;

    const postcssUse = uses.find(
      (u) => u && typeof u === 'object' && typeof u.loader === 'string' && u.loader.includes('postcss-loader')
    );
    if (!postcssUse?.options?.postcssOptions) continue;

    const po = postcssUse.options.postcssOptions;
    const originalPlugins = po.plugins;

    po.plugins = (loader) => {
      const prev = typeof originalPlugins === 'function' ? originalPlugins(loader) : originalPlugins || [];
      const arr = Array.isArray(prev) ? prev : [];

      // Avoid duplicates if config is evaluated more than once.
      const has = (name) =>
        arr.some((p) => {
          const plugin = Array.isArray(p) ? p[0] : p;
          return plugin?.postcssPlugin === name;
        });

      const next = [
        ...(has('tailwindcss') ? [] : [tailwindcss]),
        ...(has('autoprefixer') ? [] : [autoprefixer]),
        ...arr,
      ];

      return next;
    };
  }

  return webpackConfig;
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => withTailwindPostcss(webpackConfig),
  },
};
