const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handler = require('./handler');
const router = require('./router');
const config = require('./config');

const server = http.createServer( (req, res) => {
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
});

server.listen(config.port, () => {
	console.log('server is listening on port ' + config.port + ' in ' + config.envName + ' mode');
});