/*
* primary file for the api
*
*/

// dependencies
const config = require('./lib/config');
const http = require('http'), https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const router = require('./lib/router');
const helpers = require('./lib/helpers');

//the server responds to all requests with a string
const httpServer = http.createServer( (req, res) => {
	unifiedServer(req,res);
});

// let httpsOptions = {
// 	'key': fs.readFileSync('./https/key.pem'),
// 	'cert': fs.readFileSync('./https/cert.pem')
// };

// const httpsServer = https.createServer( httpsOptions, (req, res) => {
// 	unifiedServer(req,res);
// });

const unifiedServer = (req, res) => {

	//get the URL, and parse
	let parsedURL = url.parse(req.url, true);

	//get the path
	let path = parsedURL.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g,'');

	//get the query string as an object
	let queryStringObject = parsedURL.query;

	//get the HTTP method
	let method = req.method.toLowerCase();

	//get the headers as an object
	let headers = req.headers;
	
	/****** get the payload, if any
	* data is sent in a stream
	*	so, data is captured by appending the bits of the stream. an event handler is made
	*	to watch for the data event, and the decoder writes the data to the buffer variable.
	******/
	let decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', (data) => {
		buffer += decoder.write(data);
	});

	/******
	*	the end event is fired when the stream has stopped.
	******/
	req.on('end', () => {
		buffer += decoder.end();
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		};

		chosenHandler(data, (status, payload) => {
			status = typeof(status) == 'number' ? status : 200;
			payload = typeof(payload) == 'object' ? payload : {};

			//convert payload to string
			let payloadString = JSON.stringify(payload);

			//write to Head and write payloadString
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(status);
			res.end(payloadString);

			console.log('returning this response: ', status, payloadString);
		});
	});
	
};
//start the server
httpServer.listen( config.httpPort, () => {
	console.log("server listening on port " + config.httpPort);
});

// httpsServer.listen( config.httpsPort, () => {
// 	console.log('server listening on port ' + config.httpsPort);
// });

