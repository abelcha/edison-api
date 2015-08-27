'use strict'
var express = require('express');

express.response.pdf = function(obj, headers, status) {
    this.header('Content-Type', 'application/pdf');
    return this.send(obj, headers, status);
};

express.response.jsonStr = function(obj, headers, status) {
    this.header('Content-Type', 'application/json');
    return this.send(obj, headers, status);
};

var app = express();
var http = require('http').Server(app);
var port = (process.env.PORT || 8080);
var path = require('path');
var _ = require('lodash')
var fs = require('fs')
global.io = require('socket.io')(http);
require('./shared.js')(express);
global.jobs = edison.worker.initJobQueue();

global.isWorker = false;


new edison.timer();

app.get('/api/client/:id/telephone', edison.axialis.get)
app.get('/favicon.ico', function(req, res) {
    res.sendFile(process.cwd() + '/front/assets/img/favicon.ico')
})


app.use(require("multer")({
    inMemory: true,
    onFileUploadStart: function(file, req, res) {
        return true;
    }
}));

app.use(express.static(path.join(process.cwd(), 'front', 'bower_components')));
app.use(express.static(path.join(process.cwd(), 'front', 'assets')));
app.use(express.static(path.join(process.cwd(), 'front', 'angular')));
app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(require('body-parser').json({
    limit: '50mb'
}));
app.use(require('body-parser').urlencoded({
    extended: true,
    limit: '50mb'

}));
app.use(require('compression')());
app.use(require('connect-redis-sessions')({
    client: redis,
    app: "EDISON".envify(),
    ttl: 999999999
}))




app.get('/logout', function(req, res) {
    if (req.session && req.session.id)  {
        new edison.event("LOGOUT", req.session.login);
        req.session.destroy();
    }
    res.redirect('/')

});



app.post('/login', function(req, res) {
    db.model('user').validateCredentials(req, res)
        .then(function(user) {
            req.session.upgrade(user.login, function() {
                req.session.login = user.login
                req.session.nom = user.nom;
                req.session.prenom = user.prenom;
                req.session.portable = user.portable;
                req.session.service = user.service;
                req.session.email = user.email;
                req.session.root = user.root;
                req.session.pseudo = user.pseudo;
                return res.redirect(req.body.url || '/');
            });
        }, function(err) {
            return res.redirect((req.body.url || '/') + '#failure');
        })
});


app.get("/ping", function(req, res)  {
    res.json(Date.now());
})

var getEmbeddedScript = function(req) {
    return '<script>' +
        ';window.app_session = ' + JSON.stringify(req.session) +
        ';window.app_env = ' + JSON.stringify(process.env.APP_ENV) +
        '</script>';
}

app.use(function(req, res, next) {
    if (req.url.includes('.'))
        return next();
    if (req.session && !req.session.id && (!req.query.x)) {
        if (req.url.startsWith('/api/')) {
            return res.status(401).send("Unauthorized");
        } else {
            return res.status(401).sendFile(process.cwd() + '/front/views/login.html');
        }
    } else {

        if (!req.url.startsWith('/api/')) {
            fs.readFile(process.cwd() + "/front/views/index.html", 'utf8', function(err, data) {
                if (err) {
                    return res.status(500).send('error #00412')
                }
                return res.send(data + getEmbeddedScript(req));
            });
        } else {
            return next();

        }
    }
});



require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//if (!env_prod) {
app.use(function(err, req, res, next) {
    __catch(err)
    res.status(err.status || 500);
    res.json(err, err.stack);
});
//}

process.on('uncaughtException', __catch);


http.listen(port, function() {
    console.log('listening on *:' + port);
});

module.exports = app;
