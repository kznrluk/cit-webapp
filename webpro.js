// WebPro.js
var convertpass = 'magick';
var cgipass = 'puzzle.exe';

var http    = require('http');
var server  = http.createServer(response);
var io      = require('socket.io')(server);
var fs      = require('fs');
var exec    = require('child_process').exec;
var im      = require('imagemagick');
var qs      = require('querystring');
var request = require('request');

im.convert.path = convertpass;
console.log('Set Convert Pass -> \'' + im.convert.path + '\'');
console.log('Set CGI Pass     -> \'' + cgipass + '\'');

function response(req, res) {
    function responseIndex(err, html){
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            console.log('Error : index not found.')
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        }
    }
    function execpuzzle(){
        if (req.url.match(/&|;|\(|\)|\||'|\*/) != null){
            res.writeHead(400,  {'Content-Type': 'text/html'});
            res.write('wrong args');
            res.end();
            console.log('WARN   : Wrong Args ' + req.url);
            return -1;
        } else if (req.url.match('%') != null){
            res.writeHead(400,  {'Content-Type': 'text/html'});
            res.write('Error: Posted not TwitterID');
            res.end();
            console.log('WARN   : Posted not ASCII ' + req.url);
            return -1;
        }
        var args = req.url.split(/\+|\?/);
        if (args.length == 1){
            res.writeHead(400,  {'Content-Type': 'text/html'});
            res.write('Error: It is not Twiter ID. Please back and enter TwitterID.');
            res.end();            
        } else if (args.length == 2){
            exec(cgipass + ' ' + args[1], function(error, stdout) {
                if (error != null) {
                    console.log(error);
                }
                console.log('Exec   : Player ' + args[1] + ' first entry.');
                res.writeHead(200,  {'Content-Type': 'text/html'});
                res.write(stdout);
                res.end();
            });
        } else {
            exec(cgipass + ' ' + args[1] +' '+ args[2] + ' ' + args[3], function(error, stdout) {
                if (error != null) {
                    console.log(error);
                }
                console.log('Exec   : Player ' + args[3] + ' continue.');
                res.writeHead(200,  {'Content-Type': 'text/html'});
                res.write(stdout);
                res.end();
            });
        }
    }
    function responseCSS(err, css){
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.write(css);
            res.end();
        }
    }
    function responseJS(err, css){
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.write(css);
            res.end();
        }
    }
    function responseIMG(err, png){
        if (err) {
            res.writeHead(404, {'Content-Type': 'image/png'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.write(png);
            res.end();
        }
    }
    function responseICO(err, favicon){
        if (err) {
            res.writeHead(404, {'Content-Type': 'image/x-icon'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'image/x-icon'});
            res.write(favicon);
            res.end();
        }
    }
    function readUserMsg(){
        var body='';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end',function(){
            var POST = qs.parse(body);
            if(Object.keys(POST).length != 1){
                console.log('Warn   : Arg Error');
            } else if (POST.id.match(/^[\x20-\x7e]*$/) == null || POST.id.match(/^[a-zA-Z0-9_]{1,50}$/) == null){
                console.log('Warn   : Arg not ASCII');
                return -1;
            } else {
                console.log('Posted :' + POST.id);
                var url = 'http://furyu.nazo.cc/twicon/' + POST.id + '/original';
                var filetype = '';
                var imgtype = '';
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('Loading');
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
                        im.convert(['./images/'+POST.id+'.'+imgtype , '-resize', '600x600!', './slices/'+POST.id+'/original.png'], 
                            function(err, stdout){
                                if (err != null){
                                    console.log('Convert: ' + err);
                                } else {
                                    console.log('Convert: File converted ' + './slices/'+POST.id+'.png');
                                }
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

    if(req.url == '/'){
        fs.readFile('./entry.html', 'utf-8', responseIndex);
    } else if(req.url.indexOf('puzzle.cgi') != -1) {
        execpuzzle();
    } else if(req.url.indexOf('.css') != -1) {
        fs.readFile('.'+req.url, 'utf-8', responseCSS);
    } else if(req.url.indexOf('.png') != -1) {
        fs.readFile('.'+req.url, responseIMG);
    } else if(req.url.indexOf('.ico') != -1) {
        fs.readFile('.'+req.url, responseICO);
    } else if(req.url.indexOf('.js') != -1) {
        fs.readFile('.'+req.url, responseJS);
    } else if(req.url.indexOf('/wait') != -1) {
        readUserMsg();
    } else {
        res.writeHead(400, {'Content-Type': 'text/html'});
        res.end();
    }
}



io.on('connection', function (socket) {
    function loadImg(id){
        function downloaded(err, res,bod){
            sentLoading("指定されたIDのアイコンを探しています。");
            var filetype = res.headers['content-type'];
            if (filetype.indexOf('png') != -1){
                imgtype = 'png';
            } else if (filetype.indexOf('jpeg') != -1){
                imgtype = 'jpg';
            } else if (filetype.indexOf('bmp') != -1){
                imgtype = 'bmp';
            } else if (filetype.indexOf('gif') != -1){
                imgtype = 'gif';
            } else {
                sentIdError();
                console.log('不明なファイルタイプ :' + filetype);
                return 1;
            }
            console.log('Copying: ' + './images/'+id+'.'+imgtype);
            console.log('File-Type:' + filetype);
            sentLoading("アイコンのダウンロードをダウンロードします。");
            var readstream = fs.createReadStream('./images/profileimagetemp.data')
                             .pipe(fs.createWriteStream('./images/'+id+'.'+imgtype));
            readstream.on('finish', converting);
        }
        function converting(){
            try {
                fs.mkdirSync('./slices/' + id);
                console.log('Folder : Created');
            } catch(err) {
                console.log('Folder : Already created');
            }
            sentLoading("アイコンをスライドパズル用に変換しています。");
            console.log('Convert: Converting...');
            im.convert(['./images/'+id+'.'+imgtype , '-resize', '600x600!', './slices/'+id+'/original.png'], 
                function(err, stdout){
                    if (err != null){
                        console.log('Convert: ' + err);
                    } else {
                        console.log('Convert: File converted ' + './slices/'+id+'.png');
                    }
                    im.convert(['./slices/'+id+'/original.png', '-crop', '200x200', './slices/'+id+'/slide.png'], 
                        function(err){
                            if (err != null){
                                console.log('Convert: ' + err);
                            } else {
                                console.log('Convert: File sliced ' + './images/'+id+'-*.png');
                                sentFinish(id);
                            }
                        }
                    );
                }
            );
        }
        console.log('loadImg: Posted '+ id);
        var url = 'http://furyu.nazo.cc/twicon/' + id + '/original';
        var readstream = request(url, downloaded).pipe(fs.createWriteStream('./images/profileimagetemp.data'));
    }

    var ipaddr = socket.handshake.address;
    socket.emit('hello');
    socket.on('world', function () {
      console.log('Socket.io: Connected by ' + ipaddr);
    });
    socket.on('twitterid', function(data){
        var id = data.toLowerCase();
        console.log('Socket.io: Player join using ' + id);
        socket.emit('message', {value: 'TwitterID: @' + data + 'でプレイを開始します。'});
        loadImg(id);
    });
    function sentLoading(msg){
        socket.emit('message', {value: msg});
    }
    function sentFinish(id){
        sentLoading("すべての準備が整いました。");
        socket.emit('gopuzzle', {value: id});
    }
    function sentIdError(){
        var msg = "指定されたIDは存在しないか現在利用できません。もう一度お試しください。"
        socket.emit('errs', {value: msg});
    }
});

server.listen(3000);
console.log('Console: Server started.');