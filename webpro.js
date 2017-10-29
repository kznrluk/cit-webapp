// WebPro.js
var convertpass = 'magick';

var http   = require('http');
var server = http.createServer();
var fs     = require('fs');
var exec   = require('child_process').exec;
var im     = require('imagemagick');
im.convert.path = convertpass;
console.log('Set Convert Pass -> \'' + im.convert.path + '\'');
var qs     = require('querystring');

var request = require('request');


function response(req, res) {
    function responseIndex(err, html){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html);
        res.end();
    }
    function execpuzzle(){
        var args = req.url.split(/\+|\?/);
        console.log(args);
        if (args.length == 1){
            exec('puzzle', function(error, stdout) {
                if (error != null) {
                    console.log(error);
                }
                console.log('Exec puzzle binary');
                res.writeHead(200,  {'Content-Type': 'text/html'});
                res.write(stdout);
                res.end();
            });
        } else {
            exec('puzzle ' + args[1] +' '+ args[2], function(error, stdout) {
                if (error != null) {
                    console.log(error);
                }
                console.log('Exec puzzle binary');
                res.writeHead(200,  {'Content-Type': 'text/html'});
                res.write(stdout);
                res.end();
            });
        }
    }
    function responseCSS(err, css){
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(css);
        res.end();
    }
    function responseIMG(err, png){
        res.writeHead(200, {'Content-Type': 'image/png'});
        res.write(png);
        res.end();
    }
    function responseWEBP(err, webp){
        res.writeHead(200, {'Content-Type': 'image/webp'});
        res.write(webp);
        res.end();
    }
    function readUserMsg(){
        var body='';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end',function(){
            var POST = qs.parse(body);
            if(Object.keys(POST).length != 1){
                console.log('Warn : Arg Error');
            } else {
                console.log('Posted :' + POST.id);
                var url = 'http://furyu.nazo.cc/twicon/' + POST.id + '/original';
                var filetype = '';
                var imgtype = '';
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(url);
                res.end();
                console.log('Getting Avater...')
                request(url, function(err, res, bod){
                    filetype = res.headers['content-type'];
                    if (filetype.indexOf('png') != -1){
                        imgtype = 'png';
                    } else if (filetype.indexOf('jpeg') != -1){
                        imgtype = 'jpg';
                    } else if (filetype.indexOf('bmp') != -1){
                        imgtype = 'bmp';
                    } else if (filetype.indexOf('gif') != -1){
                        imgtype = 'gif';
                    } else {
                        console.log('What is this type? :' + filetype);
                        return 1;
                    }
                    console.log('File-Type:' + filetype);
                    var readstream = fs.createReadStream('./images/profileimagetemp.data')
                        .pipe(fs.createWriteStream('./images/'+POST.id+'.'+imgtype));
                    console.log('Copying: ' + './images/'+POST.id+'.'+imgtype);
                    readstream.on('finish',function(){
                        try {
                            fs.mkdirSync('./slices/' + POST.id);
                            console.log('Folder : Created');
                        } catch(err) {
                            console.log('Folder : Already created');
                        }
                        console.log('Convert: Converting...');
                        im.convert(['./images/'+POST.id+'.'+imgtype , '-resize', '600x600', './slices/'+POST.id+'/original.png'], 
                            function(err, stdout){
                                if (err != null){
                                    console.log('Convert: ' + err);
                                } else {
                                    console.log('Convert: File converted ' + './slices/'+POST.id+'.png');
                                }
                            },function(){
                                im.convert(['./slices/'+POST.id+'/original.png', '-crop', '200x200', './slices/'+POST.id+'/slide.png'], 
                                    function(err){
                                        if (err != null){
                                            console.log('Convert: ' + err);
                                        } else {
                                            console.log('Convert: File sliced ' + './images/'+POST.id+'-*.png');
                                        }
                                    }
                                );
                            }
                        );
                    });
                }).pipe(fs.createWriteStream('./images/profileimagetemp.data'));
            }
        });
    }

    console.log('Requested: ' + req.url);

    if(req.url == '/'){
        fs.readFile('./index.html', 'utf-8', responseIndex);
    } else if(req.url.indexOf('puzzle.cgi') != -1) {
        execpuzzle();
    } else if(req.url.indexOf('.css') != -1) {
        fs.readFile('.'+req.url, 'utf-8', responseCSS);
    } else if(req.url.indexOf('.png') != -1) {
        fs.readFile('.'+req.url, responseIMG);
    } else if(req.url.indexOf('.webp') != -1) {
        fs.readFile('.'+req.url, responseWEBP);
    } else if(req.url.indexOf('/wait') != -1) {
        readUserMsg();
    }
}

server.on('connection', function(){
});

server.on('request', response);
server.listen(3000);
console.log('Server started.');