
const {ipcRenderer} = require('electron');
const open = require('open');

var serverStatus = 'OFF';
var serverURL;

ipcRenderer.on('selected-folder', function(event, data) {

	const path = data.folder;

	var elem = document.querySelector('#folder-cell');
	elem.innerHTML = path;
	elem = document.querySelector('#btn-start');
	elem.disabled = false;

	switch (data.access) {
		
		case 0:
			alert("The application doesn't have access to this folder. Please choose another folder, or try running the application with administrative privileges.");
			break;

		case 1:
			M.toast({html: 'Folder Selected @' + path});
			break
		default:
			M.toast({html: 'Internal Error'});
	}
	
});

ipcRenderer.on('server-started', function (event, url) {
	document.querySelector('#btn-start').innerHTML = 'stop server';
	serverStatus = 'ON';
	serverURL = url
	document.querySelector('#status-cell').innerHTML = 'ONLINE';
	document.querySelector('#url-cell').innerHTML = 'http://' + url;
	M.toast({html: 'Server started @' + url});
});

ipcRenderer.on('server-stopped', function () {
	document.querySelector('#btn-start').innerHTML = 'start server';
	serverStatus = 'OFF';
	document.querySelector('#status-cell').innerHTML = 'OFFLINE';
	M.toast({html: 'Server stopped'});
});

function chooseFolder() {
	ipcRenderer.send('choose-folder');
}

function toggleServer() {
	if (serverStatus === 'OFF') {
		M.toast({html: 'Starting server'});
		ipcRenderer.send('start-server');
	}
	else {
		M.toast({html: 'Stopping server'});
		ipcRenderer.send('stop-server');
	}
}

function openHelpFile(file) {
	if (serverStatus == 'ON') {
		M.toast({html: "Opening the document with your default browser"});
		open(`http://${serverURL}/src/${file}`);
	} else {
		M.toast({html: 'Server should be running first. Select a folder, then start server'});
	}
}