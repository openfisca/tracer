const isProduction = 'production' === process.env.NODE_ENV

module.exports = {
  assetPrefix: isProduction ? '/openfisca-tracer' : '',
  exportPathMap: function(defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}
