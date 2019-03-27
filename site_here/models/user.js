var mongoose = require('mongoose');
var bcrypt = require("bcryptjs");



var UserSchema = mongoose.Schema({

	username :{

		type : String , 
		index : true
	},
	password :{

		type:String
	},
	email :{

		type : String
	},
	name :{

		type : String
	},
	create_date:{
		type: Date,
		default: Date.now
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

// Get Users
module.exports.getUsers = function(callback,limit){
	User.find(callback).limit(limit);
}

// Add User
module.exports.addUser = function(user, callback){
	User.create(user, callback);
}

// Update User
module.exports.updateUser = function(id, user,options, callback){
	var query = {_id: id};
	var update = {
		username: user.username,
		password: user.password,
		email: user.email,
		name: user.name
	}
	User.findOneAndUpdate(query, update, options, callback);
}

// Delete User
module.exports.deleteUser = function(id, callback){
	var query = {_id: id};
	User.remove(query, callback);
}

module.exports.createUser = function(newUser,callback){

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
         newUser.password = hash ;
         newUser.save(callback);
    });
});

}


module.exports.getUserByUsername = function(username , callback){

		var query = {username : username };
		User.findOne(query , callback);


}


module.exports.getUserById = function(id , callback){
	
	User.findById(id , callback);

}





module.exports.comparePassword = function(password ,hash , callback){

		bcrypt.compare(password , hash , function(err , isMatch){

			if(err) throw err ; 
			callback(null , isMatch);

		});


}









