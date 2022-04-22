
"use script";

const fs = require('fs');
const { removeQueryString } = require('./util.js');
const archiver = require('archiver');

var root;

function getHomepage(req, res) {

	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.status(500).send();
			return;
		}

		res.set('Content-type', 'text/html');
		res.status(200).send(data);

	});
}

function getFolder(req, res) {

	var path = root;
	if (req.url !== '/folders') {

		const len = ('/folders').length;

		path = path + '/' + req.url.substring(len);
	}

	path = decodeURI(path);
	path = removeQueryString(path)

	// check if path exists
	fs.exists(path, function(exists) {
		if (!exists) { // if doesn't exists
			res.status(404).send();
			return;
		}

		fs.stat(path, function(err, stats) {

			if (err) {
				res.status(500).send();
				return;
			}

			if (!stats.isDirectory()) { // if path is not a folder
				res.status(404).send();
				return;
			}

			if (req.query.download) {
				downloadFolder({path, res, req});
				return;
			}

			fs.readdir(path, function(err, items) {

				if (err) {
					res.status(500).send();
					return;
				}

				const data = {
					folders: [],
					files: []
				};

				const itemsCount = items.length;

				if (itemsCount == 0) {
					res.send(data);
					return;
				}
				
				var pushed = 0;

				items.forEach(function(item) {

					fs.stat(`${path}/${item}`, function(err, stats) {
						if (err) {
							res.status(500).send();
							return;
						}

						const temp = {};
						temp.name = item;
						temp.size = stats.size;

						if (stats.isDirectory())
							data.folders.push(temp);
						else
							data.files.push(temp);
						
						pushed++;

						if (pushed === itemsCount) {
							res.send(data);
						}
					});
				});
			});
		});
	});
}

function getFile(req, res) {

	const url = removeQueryString(req.url);
	var path = root + url.substring(('/files').length);

	path = decodeURI(path);

	fs.exists(path, function(exists) {

		if (!exists) {
			res.status(404).send();
			return;
		}

		fs.stat(path, function(err, stats) {

			if (err) {
				res.status(500).send();
				return;
			}

			if (!stats.isFile()) {
				res.status(404).send();
				return;
			}

			res.set('Content-type', 'application/octet-stream');
			res.set('Content-length', stats.size);
			const stream = fs.createReadStream(path);

			stream.pipe(res);
			return;

		});
	});
}


function getInclude(req, res) {

	const path = `${__dirname}/${removeQueryString(req.url).substring(1)}`;
	const ext = req.params.ext;

	fs.exists(path, function(exists) {

		if (!exists) {
			res.status(404).send();
			return;
		}

		fs.readFile(path, function(err, data) {

			if (err) {
				res.status(500).send();
				return;
			}

			var content_type;

			switch (ext) {
				case 'js':
					content_type = 'text/javascript';
					break;
				case 'css':
					content_type = 'text/css';
					break;
				case 'png':
					content_type = 'image/png';
					break;
				case 'md':
					content_type = 'text/markdown';
					break;
				case 'html':
					content_type = 'text/html';
					break;
				default: 
					content_type = 'application/octet-stream';
			}

			res.set('Content-type', content_type);
			res.status(200).send(data);

		});
	});
}

function downloadFolder({path, res, req}) {

	if (path.charAt(path.length - 1) === '/') {
		path = path.substring(0, path.length - 1);
	}

	const archive = archiver('zip');

	archive.directory(path, false);

	archive.on('error', function(err) {
		res.status(500).send();
	});

	req.on('close' , function(){
		archive.abort();
	});

	res.set('Content-type', 'application/zip');
	archive.pipe(res);
	archive.finalize();

}

function setRoot(path) {
	root = path;
}


module.exports = { getHomepage, getFile, getInclude, getFolder, setRoot };