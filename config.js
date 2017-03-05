var serverSrc = 'site/server';

var config = {
  debug: true,
  use_https: true,
  game_page: 'game_view.html',
  server: {
    src: serverSrc + '/server.js',
    host: 'localhost',
    http_port: 8080,
    https_port: 443,
    http_address: 'http://localhost:8080',
    https_address: 'http://localhost:443',
    whitelist: ['/config.js'],
  },
  matchmaker: {
    src: 'site/server/matchmaker.js',
    host: 'localhost',
    port: 3001,
    http_address: 'ws://localhost:3001',
    https_address: 'wss://localhost:3001',
    elo_k: 15,
    round_time: 20000
  },
  router: {
    src: 'site/server/router.js',
    host: 'localhost',
    port: 3002,
    http_address: 'ws://localhost:3002',
    https_address: 'wss://localhost:3002'
  },
  serverTests: {
    testFiles: [serverSrc + '/**/test/*.spec.js'],
    allFiles: [serverSrc + '/**/*.js'],
    port: 8889,
    address: 'http://localhost:8889'
  },
  htmlFiles: ['site/**/*.html']
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
};
