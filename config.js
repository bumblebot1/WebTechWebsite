var serverSrc = 'site/server';

module.exports = {
  server:{
    src: serverSrc + '/server.js',
    port: 8080, //at the moment this is hardcoded into server but will be passed as parameter TODO
    address: 'http://localhost:8080'
  },
  serverTests: {
    testFiles: [serverSrc + '/**/test/*.spec.js'],
    allFiles: [serverSrc + '/**/*.js'],
    port: 8889,
    address: 'http://localhost:8889'
  }
}
