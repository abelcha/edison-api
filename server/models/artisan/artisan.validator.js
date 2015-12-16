module.exports = function(schema) {
    var V1 = requireLocal('config/_convert_artisan_V1.js');
    var moment = require('moment');

    var getSubStatus = function(sst, res) {
        var _ = require('lodash');
        var d = sst.document;
        if (sst.quarantained) {
            return 'QUA';
        }
        if (sst.tutelle) {
            return 'TUT';
        }
        if (sst.oneShot) {
            return 'ONE'
        }
        if (sst.status === "POT" && _.get(d.contrat, 'ok') && _.get(d.cni, 'ok') && _.get(d.kbis, 'ok')) {
            return 'HOT';
        }

        if (res.inters_sp_regle >= 15) {
            return 'REG'
        }
        if (res.inters_sp_regle >= 5) {
            return 'CONF'
        }
        if (res.inters_sp_regle >= 2) {
            return 'FORM'
        }
        if (res.inters_all >= 1) {
            return 'NEW'
        }
    }

    var isBlocked = function(sst, res) {
        if (sst.subStatus === 'REG') {
            return res.inters_sp_non_regle >= sst.interLimit;
        } else if (sst.subStatus === "CONF") {
            return res.inters_sp_non_regle >= 10;
        } else
        if (sst.subStatus === "FORM") {
            return res.inters_sp_non_regle >= 3;
        } else if (sst.subStatus == "NEW") {
            return res.inters_sp_non_regle >= 2;
        }
        return false;
    }


    schema.pre('save', function(next) {
        var _this = this;
        _this.loc = [_this.address.lt, _this.address.lg]
        if (_this.status !== 'ARC') {

            var async = require('async');
            async.parallel({
                inters_sp: function(cb) {
                    db.model("intervention").count({
                        'artisan.id': _this.id,
                        'reglementSurPlace': true,
                        'status': {
                            $in: ['ENC', 'VRF']
                        }
                    }).count(cb)
                },
                inters_sp_regle: function(cb) {
                    db.model("intervention").count({
                        'artisan.id': _this.id,
                        'reglementSurPlace': true,
                        'compta.reglement.recu': true,
                        'status': {
                            $in: ['ENC', 'VRF']
                        }
                    }).count(cb)
                },
                inters_sp_non_regle: function(cb) {
                    db.model("intervention").count({
                        'artisan.id': _this.id,
                        'reglementSurPlace': true,
                        'compta.reglement.recu': false,
                        'status': {
                            $in: ['ENC', 'VRF']
                        }
                    }).count(cb)
                },
                inters_all: function(cb) {
                    db.model("intervention").count({
                        'artisan.id': _this.id,
                        'status': {
                            $in: ['ENC', 'VRF']
                        }
                    }).count(cb)
                },
                quarantained: function(cb) {
                    db.model('signalement').count({
                        sst_id: _this.id,
                        level: '2',
                        ok: false
                    }).count(cb)
                },
            }, function(err, result) {
                _this.quarantained = result.quarantained;
                _this.status = result.inters_all ? "ACT" : "POT";
                _this.subStatus = getSubStatus(_this, result);
                _this.blocked = isBlocked(_this, result);
                //if (_this.subStatus || _this.blocked)
                //  console.log(_this.id, _this.subStatus, _this.blocked)
                _this.cache = db.model('artisan').Core.minify(_this);
                next();
            })

        } else {
            _this.subStatus = null;
            _this.cache = db.model('artisan').Core.minify(_this);
            next();
        }
    });
    schema.post('save', function(doc) {
        /*        db.model('intervention').update({
                    'sst': doc.id
                }, {
                    $set: {
                        'artisan.subStatus': doc.subStatus,
                        'cache.f.ss': doc.subStatus
                    }
                }, {
                    multi:true
                }, function(err, resp) {
                    console.log('-->', err, resp)
                });
        */
        if (!isWorker) {
            db.model('artisan').uniqueCacheReload(doc)
            if (envProd && (!doc.date.dump || moment().subtract(5000).isAfter(doc.date.dump))) {
                var v1 = new V1(doc);
                v1.send(function(resp) {
                    console.log(resp)
                });
            }
        }
    })
}
