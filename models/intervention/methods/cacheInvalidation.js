'use strict';
var async = require("async");

module.exports = function(schema) {

  var selectedFields = [
    '-_id',
    'id',
    'telepro',
    'status',
    'client.civilite',
    'client.nom',
    'client.address',
    'categorie',
    'prixAnnonce',
    'artisan',
    'date.intervention',
    'date.ajout'
  ].join(' ');


  var getFltr = function(inter) {
    var hour = 60 * 60 * 1000;
    var day = hour * 24;
    var week = day * 7;
    var month = week * 4;

    var now = Date.now();
    var dateInter = (new Date(inter.date.intervention)).getTime();
    return new Promise(function(resolve, reject) {
      var fltr = {};

      if (inter.status === 'ENC') {
        fltr.enc = 1;
        if (now > dateInter + (2 * hour)) {
          fltr.avr = 1;
          if (now > dateInter + week) {
            fltr.Uavr = 1;
          }
        }
      }
      if (inter.status === 'INT' && !inter.date.paiementCLI && now > dateInter + week) {
        fltr.arl = 1;
        if (now > dateInter + month) {
          fltr.Uarl = 1;
        }
      }
      if (inter.status === 'APR') {
        fltr.apr = 1;
      }
      resolve(fltr);
    });
  }


  var translate = function(e, cb) {
    if (e.id % 100 === 0)
      console.log(e.id);
    getFltr(e).then(function(fltr) {
      cb(null, {
        fltr: fltr,
        t: e.telepro,
        id: e.id,
        ai: e.artisan.id,
        s: edison.config.etatsKV[e.status].n,
        sx: edison.config.etatsKV[e.status].c,
        c: edison.config.categoriesKV[e.categorie].n,
        cx: edison.config.categoriesKV[e.categorie].c,
        n: e.client.civilite + ' ' + e.client.nom,
        a: e.artisan.nomSociete ||  "",
        pa: e.prixAnnonce,
        da: e.date.ajout,
        di: e.date.intervention,
        ad: e.client.address.cp + ', ' + e.client.address.v
      });
    })
  }

  schema.statics.cacheActualise = function(id) {

    redis.get("interventionList", function(err, reply) {
      if (!err && reply) {
        var data = JSON.parse(reply);
        var index = _.findIndex(data, function(e, i) {
          return e.id === id;
        })

        db.model('intervention').findOne({
          id: id
        }).then(function(doc) {
          translate(doc, function(err, result) {
            data[index] = result;
            redis.set("interventionList", JSON.stringify(data));
            io.sockets.emit('interventionListChange', data[index]);

          });
        })
      }
    });

  }

  schema.statics.cacheReload = function() {
    return new Promise(function(resolve, reject) {
      db.model('intervention').find().sort('-id').select(selectedFields).then(function(docs) {
        async.map(docs, translate, function(err, result)  {
          resolve(result);
          redis.set("interventionList", JSON.stringify(result), function() {
            redis.expire("interventionList", 6000)
          })
        });
      }, function(err) {
        console.log(err);
      });
    });
  }
}
