module.exports = function(app) {
    var onSuccess = function(res) {
        return function(result) {
            if (res.headersSent === false)
                return res.status(200).send(result);
        }
    }

    var onFailure = function(res) {
        return function(err) {
            if (res.headersSent === false) {
                console.log(err.stack || JSON.stringify(err, undefined, 1))
                res.status(400).send(JSON.stringify(err, undefined, 1));
            }
        }
    }


    app.get('/api/:fn', function(req, res) {
        if (typeof edison.methods[req.params.fn] === 'function') {
            return (edison.methods[req.params.fn](req, res))
        } else {
            res.sendStatus(404);
        }
    })

    app.get('/api/search/:text', edison.search)

    var uniqueModel = function(model, method, req, res) {
        return new Promise(function(resolve, reject) {
            if (model[method].findBefore === void(0) || model[method].findBefore !== false) {
                var idIsNumber = model.schema.paths._id.instance === 'Number'
                model.findOne({
                    _id: idIsNumber ? (parseInt(req.params.id) || 0) : req.params.id
                }).then(function(data) {
                    if (!data)
                        reject("Document Not Found");
                    model[method].fn(data, req, res)
                        .then(resolve, reject);
                }, reject)
            } else {
                model[method].fn(req.params.id, req, res)
                    .then(resolve, reject);
            }
        })
    }


    app.all('/api/:model/:id/:method', function(req, res, next) {
        var model = db.model(req.params.model);
        var method = req.params.method;
        if (!model)
            return next();
        if (typeof model[method] === "undefined")
            return next();
        if (model[method].unique === true && model[method].method === req.method) {
            uniqueModel(model, method, req, res).then(onSuccess(res), onFailure(res));
        } else {
            next();
        }
    });

    app.post('/api/:model', function(req, res, next) {
        var model = db.model(req.params.model);
        var method = 'save';
        if (!model ||  typeof model[method] !== "function" || model[method].length !== 2) {
            return next();
        }
        model[method](req, res).then(onSuccess(res), onFailure(res))
    });

    app.all('/api/:model/:method', function(req, res, next) {
        var model = db.model(req.params.model);
        var method = req.params.method;
        if (!model ||  typeof model[method] !== "function" || model[method].length !== 2) {
            return next();
        }
        model[method](req, res).then(onSuccess(res), onFailure(res))
    });

    app.all('/api/:model/:id', function(req, res, next) {
        var model = db.model(req.params.model);
        var method = req.params.method;
        var id = req.params.id;
        if (!model || !id)
            return next();
        id = id.match(/^[0-9]+$/i) ? parseInt(id) : id;
        model.view(id, req, res).then(onSuccess(res), onFailure(res));
    });

    app.get('/api/map/:method', function(req, res) {
        if (!edison.map[req.params.method]) {
            return res.status(400).send("Unknown Method");
        }
        edison.map[req.params.method](req.query, res)
    });


    app.all("*", function(req, res) {
        res.status(404).send('X Not Found');
    });

};
