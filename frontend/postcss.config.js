// PostCSS runner: processes the CSS pipeline during dev and build.
// Tailwind v4 ships its own PostCSS plugin (@tailwindcss/postcss);
// autoprefixer adds vendor prefixes for broader browser support.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
