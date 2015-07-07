'use strict';
var config = requireLocal('config/dataList')
var async = require("async");
var FiltersFactory = requireLocal('config/FiltersFactory');
var _ = require("lodash")
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();
var d = requireLocal('config/dates.js')
var uuid = require('uuid')


module.exports = function(schema) {

    var selectedFields = [
        '-_id',
        'id',
        'login',
        "sav",
        'status',
        'client.civilite',
        'client.nom',
        'client.address',
        'categorie',
        'prixAnnonce',
        'prixFinal',
        'artisan',
        'reglementSurPlace',
        'date',
        "aDemarcher",
    ].join(' ');



    var translate = function(e) {
        if (e.status === "ENC" && Date.now() > (new Date(e.date.intervention)).getTime()) {
            e.status = 'AVR';
        }

        if (e.id % 10 === 1)
            console.log(e.id)
        console.log(e.date, e.date.paiementSST ? 1 : undefined, e.date.paiementCLI ? 1 : undefined)
        var rtn = {
            t: e.login.ajout,
            id: e.id,
            ai: e.artisan.id,
            s: config.etats[e.status].order,
            c: config.categories[e.categorie].order,
            n: e.client.civilite + ' ' + e.client.nom,
            a: e.artisan.nomSociete,
            pa: e.prixFinal || e.prixAnnonce,
            da: d(e.date.ajout),
            di: d(e.date.intervention),
            ps:e.date.paiementSST ? 1 : undefined,
            pc:e.date.paiementCLI ? 1 : undefined,
            ad: e.client.address.cp + ', ' + e.client.address.v,
            dm: e.login.demarchage || undefined
        };
        var fltr = FiltersFactory("intervention").filter(e);
        if (!_.isEmpty(fltr)) {
            rtn.f = fltr
        }
        return rtn;
    }
    schema.statics.translate = translate;
    schema.statics.cacheActualise = function(doc) {
        lock.writeLock(function(release) {
            redis.get("interventionList", function(err, reply) {
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
                    redis.set("interventionList", JSON.stringify(data), function() {
                        result._date = Date.now() 
                        io.sockets.emit('interventionListChange', result);
                        //sometimes it's too fast
                        setTimeout(function() {
                            io.sockets.emit('interventionListChange', result);
                        }, 2500)
                        release();
                    });
                }
            });
        });
    }

    schema.statics.cacheReload = function() {
        return new Promise(function(resolve, reject) {
            db.model('intervention').find().sort('-id').select(selectedFields).then(function(docs) {
                var result = docs.map(translate)
                redis.set("interventionList", JSON.stringify(result), function() {
                    resolve(result);
                })
            }, reject);
        });
    }
}
