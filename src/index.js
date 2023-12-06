const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { getMsg, getLoc } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

let count = 0;

io.on("connection", (socket) => {
	console.log("new websocket");

	socket.on("join", ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room); //sends event to client in this room
		socket.emit("msg", getMsg("Admin", "Welcome to Chat App")); //send to current client
		socket.broadcast
			.to(user.room)
			.emit("msg", getMsg("Admin", `${user.username} has joined`)); //send to all exccept current client
		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUserInRoom(user.room),
		});
		callback();
	});

	socket.on("sendMsg", (msg, callback) => {
		const user = getUser(socket.id);
		const filter = new Filter();
		if (filter.isProfane(msg)) {
			return callback("Bad words not allowed");
		}
		io.to(user.room).emit("msg", getMsg(user.username, msg)); //send to all clients
		callback();
	});

	socket.on("sendLocation", (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			"locationMsg",
			getLoc(user.username, `https://google.com/maps?q=${coords.lati},${coords.longi}`)
		);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit("msg", getMsg("Admin", `${user.username} left the room`));
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUserInRoom(user.room),
			});
		}
	});
	/* socket.emit("countUpdated", count);

	socket.on("increment", () => {
		count++;
		//socket.emit("countUpdated", count);
		io.emit("countUpdated", count);
	}); */
});

server.listen(port, () => {
	console.log("server running on port:", port);
});
