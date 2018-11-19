let environments = {
	staging: {
		'port': 3000,
		'envName': 'staging'
	},

	production: {
		'port': 5000,
		'envName': 'production'
	}
};
//get the current environment
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;
//export it
module.exports = envToExport;