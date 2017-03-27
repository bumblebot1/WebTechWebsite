// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server: change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use.

var http = require("http");
var https = require("https");
var fs = require("fs");
var config = require("../../config.js");
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var types, banned;
var whitelist = config.server.whitelist

var options = {
    key: fs.readFileSync('site/server/ssl_certs/key.pem'),
    cert: fs.readFileSync('site/server/ssl_certs/cert.pem')
};

start();

// Start the http service.  Accept only requests from localhost, for security.
function start() {
    types = defineTypes();
    banned = [];
    banUpperCase("./site/public/", "");
    if (config.use_https) {
        https.createServer(options, handle).listen(config.server.https_port, config.server.host);
        console.log("Server running at", config.server.https_address);
    } else {
        http.createServer(handle).listen(config.server.http_port, config.server.host);
        console.log("Server running at", config.server.http_address);
    }
}

// Serve a request by delivering a file.
function handle(request, response) {
    var url = request.url.toLowerCase();
    var accept = request.headers.accept;
    var supportXHTML = accept.indexOf(types.xhtml) !== -1;
    var question = url.indexOf("?");
    if (question == -1) question = url.length;
    url = url.substring(0, question);
    if (isWhitelisted(url)) {
        var file = "." + url; //only whitelisted urls get access to root folder
        return prepareFile(file, supportXHTML, response);
    }
    if (url.endsWith("/")) url = url + "index.html";
    if (isBanned(url)) return fail(response, NotFound, "URL has been banned");

    var file = "./site/public" + url;
    prepareFile(file, supportXHTML, response);
}

function prepareFile(file, supportXHTML, response) {
    var type = findType(file, supportXHTML);
    if (type == null) return fail(response, BadType, "File type unsupported");
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

function isWhitelisted(url) {
    for (var i=0; i < whitelist.length; i++) {
        var elem = whitelist[i];
        if (url === elem) return true;
    }
    return false;
}

function lookupList(url, list) {
    for (var i=0; i < list.length; i++) {
        var elem = list[i];
        if (url.startsWith(elem)) return true;
    }
    return false;
}
// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url) {
    return lookupList(url, banned);
}

// Find the content type to respond with, or undefined.
function findType(url, supportXHTML) {
    var dot = url.lastIndexOf(".");
    var question = url.indexOf("?");
    if (question == -1) question = url.length;
    var extension = url.substring(dot + 1, question);
    var type = types[extension];
    var index_page = url.indexOf("index.html") !== -1;
    if (type === types.html && supportXHTML && !index_page) return types.xhtml;
    else return type;
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {
    if (err) {
        console.log(err)
        return fail(response, NotFound, "File not found");
    }
    var typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as xhtml ("application/xhtml+xml").  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: for a more complete list, install
// the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        html : "text/html",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: "application/xhtml+xml",      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
