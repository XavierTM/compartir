
'use strict';

const getIP = require('ip').address;
const fs = require('fs');

function removeQueryString(url) {

	const markIndex = url.indexOf('?');
	if (markIndex !== -1) {
		return url.substring(0 , markIndex);
	}

	return url;
}

function checkPermissions(path, callback) {
	
	fs.access(path, fs.constants.R_OK, function(err) {

		if (err) {
			callback(0);
			return;
		}

		callback(1);
		
	});
}

function status_500({err, res}) {
	res.status(500).send();
	console.log(err);
}

function avoidPathInjection(req, res, next) {

	if (req.url.indexOf('/..') != -1) {
		res.status(404).send('Please');
		return;
	}

	next();
}

module.exports = { removeQueryString, getIP, checkPermissions, avoidPathInjection, };