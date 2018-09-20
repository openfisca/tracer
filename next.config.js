const isProduction = 'production' === process.env.NODE_ENV
const withCSS = require('@zeit/next-css')
const withImages = require('next-images')

module.exports = withCSS(withImages({
  assetPrefix: isProduction ? '/openfisca-tracer' : '',
  exportPathMap: function(defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}))
