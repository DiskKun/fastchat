const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
	maxHttpBufferSize: 1e8
});
const fs = require('fs');


var connected = 0;

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', (socket) => {
	var displayName = "User" + Math.floor(Math.random()*1000);
	connected++;
	io.emit('count', connected);
	io.emit('server send', displayName + " entered the room.");
	
	socket.on('disconnect', () => {
		connected--;
		io.emit('count', connected);
		io.emit('server send', displayName + " left the room.");
	});
	
	socket.on('chat message', msg => {
		io.emit('chat send', displayName + ": " + msg);
		console.log(msg);
	});

	socket.on('upload', (file, callback) => {
		console.log(file);
		//fs.writeFile(__dirname + "/tmp/upload/", file, (err) => {
		//	callback({ message: err ? "failure" : "success" });
		//});
		if (file != null) {
			fs.writeFileSync(__dirname + "/public/file.file", file);
		}
		io.emit('server send', displayName + " uploaded a file.");
		io.emit('newfile');
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
