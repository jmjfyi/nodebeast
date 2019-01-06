let fs = require('fs');
let path = require('path');

//define the base directory

module.exports = {
	
	basedir: path.join(__dirname, '/../.data/'),

	create: (dir, file, data, callback) => {
		//open the file
		fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', (err, fileDesc) => {
			if (err) { callback('could not create new file, it may already exist'); }
			//convert data to string
			let stringdata = JSON.stringify(data);
			//write to file and close
			fs.writeFile(fileDesc, stringdata, (err) => {
				if (err) { callback('error writing to a new file'); }
				fs.close(fileDesc, (err) => {
					if(err) { callback('error closing the new file'); }
				});
			});
		});
	},
}