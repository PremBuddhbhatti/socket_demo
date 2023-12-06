const users = [];

const addUser = ({ id, username, room }) => {
	//clear data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	//validation
	if (!username || !room) {
		return {
			error: "Username and room are required",
		};
	}

	//checking for duplicate user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	//validate username
	if (existingUser) {
		return {
			error: "username is taken. Try another",
		};
	}

	//store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};
const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id;
	});

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
	return users.filter((user) => user.room === room);
};

module.exports = {
	addUser,
	removeUser,
	getUserInRoom,
	getUser,
};
