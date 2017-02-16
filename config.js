var clientSrc = 'site/public/scripts';
var serverSrc = 'site/server';

module.exports = {
  server:{
    src: serverSrc + '/server.js',
    port: 8080, //at the moment this is hardcoded into server but will be passed as parameter TODO
    address: 'http://localhost:8080'
  },
  clientTests:{
    testFiles: [clientSrc + '/**/test/*.spec.js'],
    allFiles: [clientSrc + '/**/*.js'],
    port: 8888,
    address: 'http://localhost:8888'
  },
  serverTests: {
    testFiles: [serverSrc + '/**/test/*.spec.js'],
    allFiles: [serverSrc + '/**/*.js'],
    port: 8889,
    address: 'http://localhost:8889'
  }
}
