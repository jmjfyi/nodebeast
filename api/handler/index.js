module.exports = {
	sample: (data, callback) => {
		//callback a status code, and a payload object
		callback(406, {'name': 'sample handler'});
	},

	notFound: (data, callback) => {
		callback(404);
	}
};