module.exports = function(schema) {

    schema.statics.view = function(prod, req, res) {
        return new Promise(function(resolve, reject) {
            db.model('signal').findById(prod).then(function(resp) {
                if (!resp)
                    return reject('unknown signalement');
                resolve(resp)
            }, reject)
        })
    }

    schema.statics.list = function(req, res) {
        return new Promise(function(resolve, reject) {
            db.model('signal').find().then(resolve, reject)
        })
    }
};
