const isProduction = 'production' === process.env.NODE_ENV

module.exports = {
  assetPrefix: isProduction ? '/{reponame}' : '',
  exportPathMap: function(defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}
