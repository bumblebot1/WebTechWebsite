var serverSrc = 'site/server';

module.exports = {
  server: {
    src: serverSrc + '/server.js',
    http_port: 8080,
    https_port: 443,
    http_address: 'http://localhost:8080',
    https_address: 'http://localhost:443'
  },
  matchmaker: {
    src: 'site/server/matchmaker.js',
    host: 'localhost',
    port: 3001,
    address: 'http://localhost:3001',
    elo_k: 15,
    round_time: 20000
  },
  router: {
    src: 'site/server/router.js',
    host: 'localhost',
    port: 3002,
    address: 'http://localhost:3002'
  },
  serverTests: {
    testFiles: [serverSrc + '/**/test/*.spec.js'],
    allFiles: [serverSrc + '/**/*.js'],
    port: 8889,
    address: 'http://localhost:8889'
  }
}
