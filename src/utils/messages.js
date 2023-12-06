const getMsg = (username, text) => {
	return {
		username,
		text,
		createdAt: new Date().getTime(),
	};
};

const getLoc = (username, locURL) => {
	return {
		username,
		locURL,
		createdAt: new Date().getTime(),
	};
};
module.exports = {
	getMsg,
	getLoc,
};
