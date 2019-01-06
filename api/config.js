let environments = {
	staging: {
		'httpPort': 3000,
		'httpsPort': 3001,
		'envName': 'staging',
		'hashingSecret' : 'thisisasecret'
	},

	production: {
		'httpPort': 5000,
		'httpsPort': 5001,
		'envName': 'production',
		'hashingSecret': 'thisisalsoasecret'
	}
};
//get the current environment
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;
//export it
module.exports = envToExport;