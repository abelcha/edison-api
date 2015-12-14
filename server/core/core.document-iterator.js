var _ = require('lodash')
var async = require('async')
module.exports = function(core) {
    return function(req, res) {

        if (!isWorker) {
            return edison.worker.createJob({
                name: 'db',
                model: core.name,
                method: 'iterator',
                req: _.pick(req, 'query', 'session')
            })
        }
        return new Promise(function(resolve, reject) {
            try {
                var q = JSON.parse(req.query.q);
            } catch (e) {
                var q = {}
            }
            console.log('-->', q)
            core.model().find(q, {}).populate('sst').then(function(resp) {
                console.log('==>', resp.length)
                var i = 0;
                async.eachLimit(resp, 10, function(e, cb) {
                        try {
                            if (i++ % 100 === 0) {
                                console.log(Math.round(i * 100 / resp.length) + '%')
                            }
                            var conditions = {
                                    _id: e.id
                                },
                                update = {
                                    $set: {
                                        cache: core.minify(e)
                                    }
                                },
                                options = {
                                    multi: true
                                };
                                update.$set['artisan.login.management'] = _.get(e, 'sst.login.management');
                                update.$set.cache.mn = _.get(e, 'sst.login.management');
                /*            if (core.name === "intervention" && e && e.sst && e.sst.subStatus) {
                                update.$set['artisan.subStatus'] = e.sst.subStatus
                            } else {
                                update.$set['artisan.subStatus'] = ""
                            }*/
                            core.model().update(conditions, update, options, function(err, resp) {
                                cb(null)
                            });
                            e = null;
                            conditions = null;
                            updates = null
                        } catch (e) {
                            __catch(e)
                        }
                    },
                    function(err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve('ok')
                    })
            }, reject)
        })
    }
}
