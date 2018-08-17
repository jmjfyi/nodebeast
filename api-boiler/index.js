/*
 * index.js
 * entry point for the API
 */

//Dependencies
const http = require('http'), https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string-decoder').StringDecoder;

const config = require('./config');
const handler = require('./lib/handler');

//create the servers
const httpServer = http.createServer( (req, res) => {
	server(req, res);
});

// @TODO set up SSL on server 
// const httpsServer = https.createServer( config.httpsOptions, (req, res) => {
// 	server(req, res);
// });

const server = (req, res) => {
	//get the data out of the request
	let data = {
		'urlParsed': url.parse(req,url, true),
		'path': urlParsed.pathname,
		'pathTrimmed': (urlParsed.pathname).replace(/^\/+|\/+$/g,''),
		'method': req.method.toLowerCase(),
		'query': urlParsed.query,
		'headers': req.headers
	};

	//get the data stream and write it to the buffer
	req.on('data', (data) =>{
		let buff = decoder.write(data);
	});

	//when it's done, process
	req.on('end', () => {
		//end the buffer
		buff += decoder.end();

		//send the data to the handler
		handler.run(data, (status, payload) => {

		});
	});
}

//start the server
httpServer.listen( config.httpPort, (req, res) => {
	console.log("HTTP server started. Listening on port ", config.httpPort);
});

// @TODO set up SSL on server
// httpsServer.listen(config.httpsPort, (req, res) => {
// 	console.log('HTTPS server started. Listening on port ', config.httpsPort);
// });