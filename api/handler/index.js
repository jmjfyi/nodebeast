let _data = require('../lib/data');
let helpers = require('../lib/helpers');
let handlers = {};

handlers.sample = (data, callback) => {
		//callback a status code, and a payload object
		callback(406, {'name': 'sample handler'});
	};

handlers.notFound = (data, callback) => {
		callback(404);
	},
handlers.ping = (data, callback) => {
		callback(200);
	};

handlers.users = (data, callback) => {
	let acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else { callback(405); }
};

handlers._users = {
	post: (data, callback) => {
		//validat the fields
		let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
		let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
		let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

		if (!firstName || !lastName || !password || !tosAgreement) { callback(400, {'error': 'missing required fields'}); }
		//check to see if the user exists
		_data.read('users', phone, (err, data) => {
			//if there's no error, it already exists
			if(!err) { callback(400, {'error' : "a user with that phone number already exists"}); }
			//hash the password
			let hashedPassword = helpers.hash(password);

			if(hashedPassword) {
				let userObj = {
					'firstName' : firstName,
					'lastName' : lastName,
					'phone': phone,
					'hashedPassword': hashedPassword,
					'tosAgreement': true
				};

				_data.create('users', phone, userObj, (err) => {
					if(err) { console.log(err); callback(500, {"error" : 'could not create user'}); }
					else { callback(200); }
				});
			}
		});
	},

	//required: phone
	// @TODO only let an authenticated user acces their object
	get: (data, callback) => {
		//check the phone number is valid
		let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
		
		if(!phone) { callback(400, {'error': 'missing required field'}); }
		
		_data.read('users', phone, (err, data) => {
			if(!err && data) {
				delete data.hashedPassword;
				callback(200, data);
			} else { callback(404); }
		});
	},

	//required: phone
	//optional: firstName, lastName, password (at least one must be given)
	put: (data, callback) => {
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
		let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
		let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

		if(!phone) { callback(400, {'error': 'missing required field'}); }
		if(firstName || lastName || password) {
			_data.read('users', phone, (err, userData) => {
				if(!err && userData) {
					if(firstName) { userData.firstName = firstName; }
					if(lastName) { userData.lastName = lastName; }
					if(password) { userData.hashedPassword = helpers.hash(password); }

				} else { callback(400, {'error': "specified user does not exist"}); }
			});
		} else { callback(400, {'error': 'missing fields to update'}); }
	},

	//required: phone
	delete: (data, callback) => {
		let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
		
		if(!phone) { callback(400, {'error': 'missing required field'}); }
		
		_data.read('users', phone, (err, data) => {
			if(!err && data) {
				_data.delete('users', phone, (err) => {
					if(!err) {
						callback(200);
					} else { callback(500, {'error': "could not delete specified user"}); }
				});
			} else { callback(400, {'error': 'could not find specified user'}); }
		});
	}
}

module.exports = handlers;