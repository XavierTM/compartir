
"use strict";

process.env.NODE_ENV = 'production';

const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron');
const express = require('express');
//const bodyParser = require('body-parser');
const { getHomepage, getFile, getFolder, getInclude, setRoot } = require('./handlers.js');
const { getIP, checkPermissions, avoidPathInjection } = require('./util.js');


const api = express();

api.use('/folders*', express.json());
api.use(avoidPathInjection);


api.get('/', getHomepage);
api.get('/folders', getFolder);
api.get('/folders/*', getFolder);
api.get('/files/*', getFile);
api.get('/src/*.:ext', getInclude);


var port = process.env.PORT || 80;
var server;

process.on('uncaughtException', function(err) {
    if(err.errno === 'EADDRINUSE' || err.port === port){
    	port++;
    	server = api.listen(port, function() {
    		serverStarted();
    	})
    } else {
    	throw err;
    }
});

// electron code

var screen;

ipcMain.on('start-server', function() {
	server = api.listen(port, function () {
		serverStarted();
	});
});

ipcMain.on('stop-server', function ({sender}) {
	server.close();
	sender.send('server-stopped')
});

function serverStarted() {
	const fileServerURL = getIP() + `:${port}`;
	screen.webContents.send('server-started', fileServerURL);
}

ipcMain.on('choose-folder', function(event) {

	const folders = dialog.showOpenDialogSync(screen, {
		title: "Select Folder",
		buttonLabel: "Select",
		properties: ['openDirectory']
	});

	if (folders !== undefined) {

		const folder = folders[0];

		checkPermissions(folder, function(level) {

			const data = {folder, access: level};

			event.sender.send('selected-folder', data);
			setRoot(folder);

		})
	}
});

app.on('ready', function() {

	screen = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 700,
		height: 660,
		resizable: false,
		maximizable: false
	});

	screen.loadURL(`file://${__dirname}/main.html`);
});

Menu.setApplicationMenu(Menu.buildFromTemplate([]));




