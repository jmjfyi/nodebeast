/*
 * Helpers for various tasks
 */
let config = require('../../config');
let crypto = require('crypto');
let helpers = {};

//create SHA256 hash
helpers.hash = (str) => {
	//validate the string
	if( typeof(str) == 'string' && str.length > 0 ) {
		let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else { return false; }
};

//parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
	try {
		let obj = JSON.parse(str);
		return obj;
	} catch(e) { return {}; }
}

module.exports = helpers;