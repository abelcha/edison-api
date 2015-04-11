
var express = require('express');
global.app = express();
var http = require('http').Server(app);
var port = (process.env.PORT || 3000);
global.path = require('path');

var dep = require('./loadDependencies');
global.npm = dep.loadJson("package.json");
global.edison = dep.loadDir("edisonFramework");
global.ed = global.edison;
global.rootPath = process.cwd();
if (process.env.REDISCLOUD_URL) {
	var url = require('url');
	var redisURL = url.parse(process.env.REDISCLOUD_URL);
	edison.redisCli = npm.redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	edison.redisCli.auth(redisURL.auth.split(":")[1]);
} else {
    edison.redisCli = npm.redis.createClient();
}
edison.redisCli.on("error", function (err) {
    console.log("Redis Error " + err);
});


// view engine setup
console.log("versisson => ", process.version)
app.set('view engine', 'ejs'); // set up ejs for templating


app.use(npm.cookieParser()); // read cookies (needed for auth)
app.use(npm.cors());
app.use(npm.bodyParser.json());
app.use(npm.bodyParser.urlencoded({ extended: true }));
app.use(npm.compression());

require('./routes')(); 



/*  !AUTHENTIFICATION */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

global.env_prod = process.env.NODE_ENV;


//if (!env_prod) {
    app.use(function(err, req, res, next) {
    	console.log(err);
        res.status(err.status || 500);
        res.json(err);
    });
//}


http.listen(port, function(){
  console.log('listening on *:' + port);
});

