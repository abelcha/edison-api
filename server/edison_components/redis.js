module.exports = function() {
  var redis = require("redis");
  var redisClient;
  if (envProd) {
    var url = require('url');
    var redisURL = url.parse(process.env.REDISTOGO_URL);
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, {
      no_ready_check: true
    });
    redisClient.auth(redisURL.auth.split(":")[1]);

  } else {
    redisClient = redis.createClient();
  }

  
  redisClient.on("error", function(err) {
    console.log("Redis Error " + err);
  });

  return redisClient;
}

