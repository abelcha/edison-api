module.exports = function(schema) {

    schema.statics.envoiDevis = {
        unique: true,
        findBefore: true,
        method: 'POST',
        fn: function(inter, req, res) {
            var params = req.body;
            if (!params.text || !params.data) {
                Promise.reject("Invalid Request")
            }
            return new Promise(function(resolve, reject) {
                var options = {
                    data: params.data,
                    html: false,
                    text: params.text.replaceAll('\n', '<br>'),
                }
                db.model('intervention').getDevis(options)
                    .then(function(buffer) {
                        console.log('-->buffer')
                        options.file = buffer;
                        mail.sendDevis(options).then(resolve, reject)
                    }, reject)
            })
        }
    }

}
