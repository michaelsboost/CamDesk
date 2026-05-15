module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('tailwindcss'),
    require('cssnano')({
      preset: ['default', {
        discardComments: { removeAll: true }, // Remove all comments
      }],
    }),
  ],
};