   module.exports = function(schema) {
       var _ = require('lodash')
       var moment = require('moment')
       var request = require('request')
       var async = require('async')

       var convert = function(ts) {
           var dt = ts.replace('.', '-').split('-').slice(0, -4).join('-');
           var hr = ts.replace('.', '-').split('-').slice(3, 6).join(':');
           return moment(dt + " " + hr).unix() * 1000
       }


       schema.statics.checkChecked = function(req, res) {
           edison.v1.get('SELECT COUNT(*) FROM scanner WHERE checked=1', function(err, resp) {
               res.json([err, resp])
           });
       }


       schema.statics.check = function(req, res) {



           if (!isWorker) {
               return edison.worker.createJob({
                   name: 'db',
                   model: 'document',
                   method: 'check',
                   req: _.pick(req, 'query', 'session')
               })
           }


           var dbl = requireLocal('config/dropbox-list').SCAN

           dbl = _(dbl).filter(function(e) {
               return e.length === 23 && _.endsWith(e, '.pdf') && e[4] === '-'
           }).map(function(e) {
               return {
                   name: e,
                   ts: convert(e)
               }
           }).value();


           var findClosest = function(x, dbl) {
               return _.find(dbl, function(e) {
                   e.diff = e.ts - x.start;

                   return (e.diff > 0 && e.diff < 10000) || (e.diff < 0 && e.diff > -1000)
               })
           }


           var moveV1 = function(closest, cb) {
               request.get({
                   url: 'http://electricien13003.com/alvin/5_Gestion_des_interventions/mvFile.php',
                   qs: {
                       file: '/SCAN/' + closest.name
                   }
               }, function(err, resp, body) {
                   cb(err, body)
               })
           }

           return new Promise(function(resolve, reject) {
               var i = 0;
               var limit = req.query.limit || 100;
               edison.v1.get("SELECT * FROM scanner WHERE checked='0' AND moved='0' ORDER BY id DESC LIMIT " + limit, function(err, resp)  {
                   async.eachLimit(resp, 10, function(row, cb) {
                       console.log(String(i++) + '/' + String(limit))
                       var closest = findClosest(row, dbl)
                       if (closest) {
                           var mrg = _.merge(row, closest)
                           moveV1(closest, function(err, resp) {
                               console.log('movev1')
                               if (err || !resp) {
                                   console.log("ERR", '<', err, ">", mrg.name, mrg.id);
                                   return cb(null, 'ERR')
                               }
                               var q = _.template("UPDATE scanner SET diff='{{diff}}', name='{{name}}', checked='1',  moved='1' WHERE id='{{id}}'")(mrg)
                               edison.v1.set(q, function(err, resp) {
                                   console.log('OK', mrg.name, mrg.id);
                                   cb(null, 'ok')
                               })
                           })
                       } else {
                           console.log('NOT FOUND', row.id)
                           edison.v1.set(_.template("UPDATE scanner SET checked='1' WHERE id='{{id}}'")(row), cb)
                       }
                   }, function(resp) {
                       resolve('ok')
                   })
               })
           })




           /*          _.each(_.filter(dbl, 'length', 23).slice(0, 10), function(e) {
                             var cvt = convert(e);
                             var closest = findClosest(cvt, )
                             console.log('-->', cvt)
                         })*/
       }
   }
