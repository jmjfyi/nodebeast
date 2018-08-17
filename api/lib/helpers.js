const crypto = require('crypto');
const config = require('./config');

module.exports = {
	
	hash: (str) => {
		if(typeof(str) != 'string' || str.length == 0) { return false; }

		let hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
		return hash;
	},

	parseJsonToObject: (str) => {
		try { 
			let obj = JSON.parse(str);
			return obj;
		}
		catch (e) { return {}; }
	},

	createRandomString: (strLength) => {
		strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
		if (!strLength) { return false; }
		else {
			let characters = "abcdefghijklmnopqrstuvwxyz01234556789", 
			str = '';

			for(i = 1; i <= strLength; i++) {
				let randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
				str += randomChar;
			}
			return str;
		}
	}

};