var request = require('request-promise');
var _ = require('lodash');

var Todoist = function() {
    var _this = this;
    this.loginRequest = request.post('https://todoist.com/API/v6/login', {
        form: {
            email: 'abel@chalier.me',
            password: 'kvx26tEb'
        }
    })
}


Todoist.prototype.applyRequest = function(opts, url) {
    var _this = this;
    var params = {
        // commands: opts,
        seq_no: '0',
        seq_no_global: '0',
        resource_types: '["all"]',
        token: _this.token
    }
    console.log(params)
    return request.post('https://todoist.com/API/v6' + url, params)

}

Todoist.prototype.request = function(opts, url) {
    var _this = this;
    return new Promise(function(resolve, reject) {
        if (!this.token) {
            _this.loginRequest
                .then(function(resp) {
                    console.log('uau')
                    _this.token = JSON.parse(resp).token;
                    _this.applyRequest(opts, url).then(resolve, reject)
                })
        } else {
            _this.applyRequest(opts, url).then(resolve, reject)
        }
    })
}


/*Todoist.prototype.request = function(type, arg) {
    arg.type = type;
    request.post('https://todoist.com/API/v6/login', {
            form: arg
        },
        function(error, response, body) {
            console.log(body);
        });
}

*/
//module.exports = Todoist;

var todoist = new Todoist()
todoist.request().then(function(resp) {
    console.log('sweg')
    console.log(resp)
}, function(err)  {
    console.log('ERRR-->', err)
})
