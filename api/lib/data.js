//dependencies
const fs = require('fs'), path = require('path');
const helpers = require('./helpers');

let lib = {};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (dir, file, data, callback) => {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDesc) => {
		
		if (err) { callback('could not create new file. it may exist.'); }
		else {
			let stringData = JSON.stringify(data);
			fs.writeFile(fileDesc, stringData, (err) =>{
				if (err) { callback('error writing to new file'); }
				else {
					fs.close(fileDesc, (err) => {
						if (err) { callback('error closing new file'); }
						else {
							callback(false);
						}
					});
				}
			});
		}
	});
};

lib.read = (dir, file, callback) => {
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
		if (!err && data) {
			let dataParsed = helpers.parseJsonToObject(data);
			callback(false, dataParsed);
		}
		else { callback(err, data); }
	});
}

lib.update = (dir, file, data, callback) => {
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDesc) => {
		if (err) { callback('could not open file for update. it may not exist.'); }
		else {
			let stringData = JSON.stringify(data);

			fs.ftruncate(fileDesc, (err) =>{
				if (err) { callback("error truncating file"); }
				else {
					fs.writeFile(fileDesc, stringData, (err) => {
						if (err) { callback('error writing to existing file.');  }
						else {
							fs.close(fileDesc, (err) => { 
								if (err) { callback('error closing the file.'); } 
								else { callback(false); }
							});
						}
					});
				}
			});
		}
	});
};

lib.delete = (dir, file, callback) => {
	fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
		if (err) { callback('error deleting file.'); }
		else { callback(false); }
	});
}

module.exports = lib;