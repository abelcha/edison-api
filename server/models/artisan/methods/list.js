'use strict'

module.exports = function(schema) {
    var redisRStream = require('redis-rstream')
    var FiltersFactory = requireLocal('config/FiltersFactory')
    var config = requireLocal('config/dataList');
    var ReadWriteLock = require('rwlock');
    var d = requireLocal('config/dates.js')

    var lock = new ReadWriteLock();
        var _ = require('lodash')

    var translate = function(e) {
        var fltr = FiltersFactory('artisan').filter(e);
        return {
            f: fltr,

            da: d(e.date.ajout),
            t: e.login.ajout,
            c: e.categories,
            id: e._id,
            n:e.nomSociete,
            r:e.representant.civilite + " " + e.representant.prenom + " " + e.representant.nom,
            s: e.status,
            cp: e.address.cp,
            v: e.address.v,
            /*cx: config.categories[e.categorie].long_name,
            n: e.client.civilite + " " + e.client.nom,
            s: e.status,
            sx: config.etatsDevis[e.status].long_name,
            cp: e.client.address.cp,
            ad: e.client.address.v,
            ev: e.envois,
            pa: e.prixAnnonce,*/
        };
    }
    schema.statics.translate = translate;

    schema.statics.cacheActualise = function(doc) {
        lock.writeLock(function(release) {
            redis.get("artisanList", function(err, reply) {
                if (!err && reply) {
                    var data = JSON.parse(reply);
                    var index = _.findIndex(data, function(e, i) {
                        return e.id === doc.id;
                    })
                    var result = translate(doc)
                    if (index !== -1) {
                        data[index] = result;
                    } else {
                        data.unshift(result);
                    }
                    redis.set("artisanList", JSON.stringify(data), function() {
                        io.sockets.emit('artisanListChange', result);
                        release();
                    });
                } else {
                    db.model('artisan').list()
                }
            });
        });
    }


    schema.statics.list = function(req, res) {
        return new Promise(function(resolve, reject) {
            redis.get('artisanList', function(err, reply) {
                if (!err && reply && !_.get(req, 'query.cache')) { // we just want to refresh the cache 
                    console.log("cached")
                    return res.send(reply)
                } else {
                    console.log("nocache")
                    db.model('artisan')
                        .find()
                        .then(function(docs) {
                            docs = _.map(docs, translate)
                            resolve(docs);
                            redis.set("artisanList", JSON.stringify(docs))
                        })
                }
            });
        });

    };

}
