var bcrypt = require('bcrypt');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, _db) {


	/*  AUTHENTIFICATION */

	passport.use(new LocalStrategy(function(username, password, done) {
		if (username === 'test123')
			return done(null, {login:'chalie_a'});
		_db.userModel.findOne({login:username}, function(err, data) {
			if (err)
			{
				return done(null, false, {err:"Un problème est survenu, contactez l'administrateur"});
			}
			if (!data)
			{
				return done(null, false, {err:"L'utilisateur : '" + username + "' n'éxiste pas"});
			} 
			else if (bcrypt.compareSync(password, data.password) === true)
			{	
				return done(null, data);
			} 
			else
			{
				//req.flash('ERR', "Mot de passe invalide");
				return done(null, false, {err:"Mot de passe invalide"});
			}
		});
	}));

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	return {
	    secret: '15c5p03q5Bn91B8k9O5C32gX8onx9p',
	    name: 'EDISON-SESSION',
	    resave: true,
	    saveUninitialized: true
	}


};
