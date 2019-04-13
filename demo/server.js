var http = require("http"),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    zlib = require('zlib');

var mimeTypes = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "mp3":"audio/mp3",
    "mp4":"video/mp4",
    "xml": "text/xml",
    "obj": "application/x-tgif",
    "mtl": "application/octet-stream",
    "dds": "application/octet-stream",
    "fbx": "application/octet-stream"
};

var defaultDoc = 'index.html';


var server = http.createServer(function(req, res) {
    var pathname = decodeURI(url.parse(req.url).pathname);

    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : '';
    if (ext === '') {
        var fix = pathname.charAt(pathname.length - 1) == '/' ? defaultDoc : '/' + defaultDoc;
        pathname += fix;
        ext = 'html';
    }

    if (!path.isAbsolute(pathname)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write("This request URL: [" + pathname + "] was not found on this server.");
        res.end();
        return;
    }
    var localPath = __dirname + pathname.replace('/', '\\');
    //console.info('localPath:' + localPath);

    fs.exists(localPath, function(exists) {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write("This request URL [" + pathname + "] was not found on this server.");
            res.end();
        } else {
            var stream = fs.createReadStream(localPath, { flags: "r", encoding: null });

            stream.on("error", function() {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>500 Server Error</h1>");
            });

            var mime = mimeTypes[ext.toLowerCase()];
            let states = fs.statSync(localPath);
            res.writeHead(200, {
                'Content-Type': mime,
                'Content-Length': states.size
            });
            stream.pipe(res);
        }
    });
}).listen(1235);
console.log('Server running at http://127.0.0.1:1235/');