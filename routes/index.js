var _session = edison.session;
var edisonAPI = edison.api;
var Intervention = require("../models/intervention");

module.exports = function() {


  app.get('/map/:method', function(req, res) {
    if (!edison.map[req.params.method]) {
      return res.status(400).send("Unknown Method");
    }
    edison.map[req.params.method](req.query, res)
  });


  app.get('/:model/:method', function(req, res) {

    var model = edison.db.model[req.params.model];
    var method = req.params.method;

    if (!model) {
      return res.status(400).send("Unknown model");
    }
    if (!model[method]) {
      return res.status(400).send("Unknown method")
    }
    model[method](req.query).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      res.status.send(err);
    })
  });



  app.get('/search/:model/:options', function(req, res) {
    var t = Date.now()
    try {
      JSON.parse(req.params.options)
    } catch (e) {
      return res.status(400).send("Invalid JSON");
    }
    edisonAPI.getData(req.params.model, JSON.parse(req.params.options))
      .then(function(result) {
        res.json(result);
      })
      .catch(function(err) {
        // Bad Request
        console.log(err.toString())
        res.status(400).send(err.toString());
      })
  })

  app.post('/api/intervention', function(req, res) {
    var inter = req.body;
    new Intervention(req.body);
    res.json("ok")
  })





  app.get('/fetchArtisans', function(req, res) {
    edison.dumpArtisan.dumpData(function(artisanList) {
      edison.db.model.artisan.remove({}, function(err) {
        edison.db.model.artisan.create(artisanList, function(err) {
          console.log(err);
          res.redirect("/api/artisans")
        });
      });
    });
  });

  app.get('/clearCache', function(req, res) {

    edison.redisCli.del("Artisans");
    edison.redisCli.del("Interventions");
    res.json("OK");

  });

  setTimeout(function() {
    npm.request.get('http://ed-front.herokuapp.com/')
  }, 60000)

  app.all('/*', function(req, res) {
    res.sendStatus(404);
  });
};
