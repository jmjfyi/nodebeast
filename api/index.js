const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handler = require('./handler');
const router = require('./router');
const config = require('./config');
const fs = require('fs');
const _data = require('./lib/data');

const http_server = http.createServer((req, res) => {
	unifiedServer(req, res);
});

//start http server
http_server.listen(config.httpPort, () => {
	console.log('server is listening on port ' + config.httpPort + ' in ' + config.envName + ' mode');
});

// let httpsOptions = {
// 	'key': fs.readFileSync('./https/key.pem'),
// 	'cert': fs.readFileSync('./https/cert.pem'),
// };

// const https_server = https.createServer( httpsOptions, (req, res) => {
// 	unifiedServer(req, res);
// });

// https_server.listen(config.httpsPort, () => {
// 	console.log('server is listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode');
// });

let unifiedServer = (req, res) => {
	//get the url and parse it
	let parsedURL = url.parse(req.url, true);
	//get the path and trim it
	let path = parsedURL.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g, '');
	//get the query string
	let queryStringObject = parsedURL.query;

	//get the HTTP method
	let method = req.method.toLowerCase();
	//get headers
	let headers = req.headers;
	//get the payload, if any
	let decoder = new StringDecoder('utf-8');
	let buffer = '';
	//on the 'data' event
	req.on('data', (data) => {
		//append the decoded result onto the buffer
		buffer += decoder.write(data);
	});
	//when the data stream ends
	req.on('end', () => {
		//end the decoder
		buffer += decoder.end();
		//get the handler
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handler.notFound;
		//set the data object
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		};

		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			payload = typeof(payload) == 'object' ? payload : {};
			let payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
		
			console.log('returning this response: ', statusCode, payloadString);
		});
	});
};
