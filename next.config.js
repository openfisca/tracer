const isProduction = 'production' === process.env.NODE_ENV
const withCSS = require('@zeit/next-css')
const withImages = require('next-images')

module.exports = withCSS(withImages({
  assetPrefix: isProduction ? '/{reponame}' : '',
  exportPathMap: function(defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}))
