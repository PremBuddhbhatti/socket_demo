const socket = io();

//!elements
const $msgForm = document.querySelector("#msgForm");
const $msgFormInput = $msgForm.querySelector("input");
const $msgFormButton = $msgForm.querySelector("button");
const $btnLocation = document.querySelector("#btnLocation");
const $msgs = document.querySelector("#msgs");

//! templates
const msgTemplate = document.querySelector("#msgTemplate").innerHTML;
const locTemplate = document.querySelector("#locationTemplate").innerHTML;
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

//! options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	//new msg element
	const $newMsg = $msgs.lastElementChild;
	console.log($newMsg);
	//height of new msg
	const newMsgStyles = getComputedStyle($newMsg);
	const newMsgMargin = parseInt(newMsgStyles.marginBottom);
	const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;

	//visible height
	const VisibleHeight = $msgs.offsetHeight;

	//height of msg container
	const containerHeight = $msgs.scrollHeight;

	//how far scrolled
	const scrollOffset = $msgs.scrollTop + VisibleHeight;

	if (containerHeight - newMsgHeight <= scrollOffset) {
		$msgs.scrollTop = $msgs.scrollHeight;
	}
};

socket.on("msg", (msg) => {
	console.log(msg);
	const html = Mustache.render(msgTemplate, {
		username: msg.username,
		msg: msg.text,
		createdAt: moment(msg.createdAt).format("h:mm a"),
	});
	$msgs.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("locationMsg", (loc) => {
	console.log(loc);
	const html = Mustache.render(locTemplate, {
		username: loc.username,
		locURL: loc.locURL,
		createdAt: moment(loc.createdAt).format("h:mm a"),
	});
	$msgs.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
});

$msgForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//disable form when sending msg
	$msgFormButton.setAttribute("disabled", "disabled");

	const msg = e.target.elements.message.value;
	socket.emit("sendMsg", msg, (error) => {
		//enable form
		$msgFormButton.removeAttribute("disabled");
		$msgFormInput.value = "";
		$msgFormInput.focus();

		if (error) {
			return console.log(error);
		}
		console.log("Delivered");
	});
});

$btnLocation.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("geolocation not supported");
	}
	//disable location button
	$btnLocation.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		//console.log("position:", position);
		socket.emit(
			"sendLocation",
			{
				lati: position.coords.latitude,
				longi: position.coords.longitude,
			},
			() => {
				console.log("location shared");
				//enable location btn
				$btnLocation.removeAttribute("disabled");
			}
		);
	});
});

socket.emit("join", { username, room }, (error) => {
	if (error) {
		location.href = "/";
	}
});
