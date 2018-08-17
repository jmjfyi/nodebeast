const _data = require('./data');
const helpers = require('./helpers');
//define handlers

let handlers = {
	ping: (data, callback) => {
	//callback an http status code, and a payload
	callback(406, {'name': 'sample handler'} );
	},

	notFound: (data, callback) => { callback(404); }, 

	users: (data, callback) => {
		var methods = ['post', 'get', 'put', 'delete'];
		if (methods.indexOf(data.method) > -1) {
			handlers._users[data.method](data, callback);
		}
	},

	tokens: (data, callback) => {
		var methods = ['post', 'get', 'put', 'delete'];
		if (methods.indexOf(data.method) > -1) {
			handlers._tokens[data.method](data, callback);
		}
	}
};

handlers._users = {
	post: (data, callback) => {
		//check required fields
		let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
		let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
		let tosAgree = typeof(data.payload.tosAgree) == 'boolean' && data.payload.tosAgree == true ? true : false;

		if (!firstName || !lastName || !phone || !password || !tosAgree) { callback(400, {'error': 'missing required fields'}); }
		else {
			_data.read('users', phone, (err,data) => {
				if (!err) { callback(500, {'error': 'a user with that phone number already exists'}); }
				else {
				//hash the password
					let hashedPassword = helpers.hash(password);
					if (!hashedPassword) { callback(500, {'error': 'could not hash the user\'s password'}); }
					else {
						//create the user
						let userObj = {
							'firstName': firstName,
							'lastName': lastName,
							'hashedPassword': hashedPassword,
							'phone': phone,
							'tosAgree': true
						}

						//store the user
						_data.create('users', phone, userObj, (err) => {
							if (err) { console.log(err); callback(500, {'error': 'could not create new user'}); }
							else { callback(200); }
						});
					}
				}
			});
		}
	},

	//phone number is required
	//only authenticated users can access their object
	get: (data, callback) => {
		let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
		if (!phone) { callback(400, {'error': 'missing required field'}); }
		else {
			_data.read('users', phone, (err, data) => {
				if (!err && data) {
					//remove the hash
					delete data.hashedPassword;
					callback(200, data);
				}
				else { callback(404); }
			});
		}
	},

	//phone number is required
	//everything else is optional (at least one has to be specified)
	//@TODO auth: users should only be able to change their info
	put: (data, callback) => {
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		if (!phone) { callback(400, {'error': 'missing required field'}); }
		else {
			let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
			let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
			let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

			if (!firstName && !lastName && !password) { callback(400, {'error': 'missing fields to update'}); }
			else {
				_data.read('users', phone, (err, userData) => {
					if (!err && userData) {
						if (firstName) { userData.firstName = firstName; }
						if (lastName) { userData.lastName = lastName; }
						if (password) { userData.hashedPassword = helpers.hash(password); }
					
						_data.update('users', phone, userData, (err) => {
							if (err) { console.log(err); callback(500, {'error': 'could not update the user'}); }
							else { callback(200); }
						});
					}
					else { callback(404); }
				});
			}
		}
	},


	delete: (data, callback) => {
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		if (!phone) { callback(400, {'error': 'missing required field'}); }
		else {
			_data.read('users', phone, (err, data) => {
				if (!err && data) {
					//remove the hash
					_data.delete('users', phone, (err) => {
						if(err) { callback(500, { 'error': 'could not delete the user specified'}); }
						else { callback(200); }
					});
					callback(200, data);
				}
				else { callback(400, {'error': 'could not find the user specified'}); }
			});
		}
	}
};

handlers._tokens = {
	post: (data, callback) => {
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
		if (!phone || !password) { callback(400, {'error': 'missing required field(s)'}); }
		else {
			_data.read('users', phone, (err, userData) => {
				if (!err && userData) {
					let passwordHashed = helpers.hash(password);
					if (passwordHashed != userData.hashedPassword ) { callback(400, {'error': 'password does not match'}); }
					else {
						let tokenId = helpers.createRandomString(20),
						expires = Date.now() + 1000 * 60 * 60,
						tokenObject = {
							'phone': phone,
							'id': tokenId,
							'expires': expires
						};

						_data.create('tokens', tokenId, tokenObject, (err) => {
							if (err) { callback(500, {'error': 'could not create the new token'}); }
							else {
								callback(200, tokenObject);	
							}
						});
					}
				}
			});
		}
	},

	get: (data, callback) => {
		let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
		if (!id) { callback(400, {'error': 'missing required field(s)'}); }
		else {
			_data.read('tokens', id, (err, tokenData) => {
				if (!err && tokenData) { callback(200, tokenData); }
				else { callback(404); }
			});
		}
	},

	put: (data, callback) => {
		let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
		let extend = typeof(data.queryStringObject.extend) == 'boolean' && data.queryStringObject == true ? true : false;
		if (!id && !extend) { callback(400, {'error': 'missing required field(s) or fields are invalid'}); }
		else {
			_data.read('tokens', id, (err, tokenData) => {
				if (err || !tokenData) { callback(400, {'error': 'token does not exist'}); }
				else { 
					if (tokenData.expires <= Date.now()) { callback(400, {'error': 'token has already expired, and cannot be extended'}); }
					else {

						tokenData.expires = Date.now() + 1000 * 60 * 60;

						_data.update('tokens', id, (err) => {
							if (err) { callback(500, {'error': 'could not update the token\'s expiration'}); }
							else { callback(200); }
						});
					} 
				}
			});
		}
	},
	delete: () => {}
}

module.exports = handlers;