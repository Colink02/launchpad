let midi = null;
let output = null;
let colorSet = false;
let storedColor;
let clear = true;
let pulse = false;
let launchpadMK2 = [
	81, 82, 83, 84, 85, 86, 87, 88, 71, 72, 73, 74, 75, 76, 77, 78, 61, 62, 63,
	64, 65, 66, 67, 68, 51, 52, 53, 54, 55, 56, 57, 58, 41, 42, 43, 44, 45, 46,
	47, 48, 31, 32, 33, 34, 35, 36, 37, 38, 21, 22, 23, 24, 25, 26, 27, 28, 11,
	12, 13, 14, 15, 16, 17, 18,
];
let buttonfunctions = {};

function onMIDIMessage(event) {
	let data = event.data,
		cmd = data[0] >> 4,
		channel = data[0] & 0xf,
		type = data[0] & 0xf0,
		note = data[1],
		velocity = data[2];
	console.log(
		"MIDI -> COMPUTER: Key " + parseInt(note.toString(16), 16) + " Pressed."
	);
	if (colorSet) {
		sendNoteTo(output, note, velocity, storedColor, pulse);
		//TODO make Event system
		handleDisplay(note);
	} else {
		sendNoteTo(output, note, velocity, 0x66, pulse);
		handleDisplay(note, velocity);
	}
}

function onMIDISuccess(midiAccess) {
	midi = midiAccess;
	output = midiAccess.outputs.values().next().value;
	// listen for connect/disconnect message
	midi.onstatechange = onStateChange;
	Array.from(midiAccess.inputs).forEach((input) => {
		input[1].onmidimessage = onMIDIMessage;
	});
}

function onMIDIFailure(msg) {
	console.log("SYSTEM -> Permission to Midi was Disallowed!", msg);
}

function onStateChange(event) {
	console.log(
		"MIDI Device >> '" +
			event.port.name +
			"' from the manufacturer '" +
			event.port.manufacturer +
			"' is '" +
			event.port.state +
			"'"
	);
}

function sendNoteTo(output, note, velocity = 0, colorData, pulse = false) {
	//output.send([0x90, parseInt(note.toString(16), 16), 0x15]);
	if (velocity == 0) return;
	console.log("called");
	if (colorSet) {
		data = hexToRgb(document.getElementById("colorData").value);
		colorData[7] = parseInt(note.toString(16), 16);
		colorData[0] = parseInt(92, 16);
		data = scaleValue(
			parseInt(data["r"], 16),
			parseInt(data["g"], 16),
			parseInt(data["b"], 16)
		);
		output.send([
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x18,
			0x0b,
			parseInt(note.toString(16), 16),
			parseInt(data.r, 16),
			parseInt(data.g, 16),
			parseInt(data.b, 16),
			0xf7,
		]);
	} else {
		output.send([0x90, parseInt(note.toString(16), 16), colorData]);
	}
}

function clearLEDS() {
	clear = true;
	output.send([0xf0, 0x00, 0x20, 0x29, 0x02, 0x18, 0x0e, 0x00, 0xf7]);
}

function spin() {
	clear = false;
	lights = [33, 43, 53, 63, 64, 65, 66, 56, 46, 36, 35, 34];
	index = 0;
	interval = setInterval(() => {
		if (clear == true) {
			clearInterval(interval);
		} else {
			setTimeout(spun(index, lights), 500);
			index++;
			if (index > lights.length - 1) {
				index = 0;
			}
		}
	}, 50);
}

function spun(index, lights) {
	output.send([0x90, parseInt(lights[index].toString(16), 16), 0x0d]);
	console.log("COMPUTER -> MIDI DEVICE: Sent Signal...");
	if (index != 1 && index != 0) {
		output.send([0x80, parseInt(lights[index - 2].toString(16), 16), 0x00]);
	} else if (index == 0) {
		output.send([
			0x80,
			parseInt(lights[lights.length - 1].toString(16), 16),
			0x00,
		]);
	} else {
		output.send([
			0x80,
			parseInt(lights[lights.length - 2].toString(16), 16),
			0x00,
		]);
	}
}

function runThrough() {
	clearLEDS();
	console.log("COMPUTER -> MIDI DEVICE: Sent Signal...");
	launchpadMK2.forEach((databyte) => {
		setTimeout(function () {
			output.send([0x90, parseInt(databyte.toString(16), 16), 0x51]);
		}, 1000);
	});
}

function sendHexData() {
	let text = document.getElementById("data").value;
	text = text.replace(/h/g, "");
	text = text.replace(/ /g, ",");
	let final = text.split(",");
	let index = 0;
	final.forEach((byte) => {
		final[index] = parseInt(byte.toString(16), 16);
		index++;
	});
	output.send(final);
}

function setColor() {
	data = hexToRgb(document.getElementById("colorData").value);
	if (data["r"] == 0 && data["g"] == 0 && data["b"] == 0) {
		colorSet = false;
		storedColor = null;
		console.log(
			"SYSTEM >> Color is set to Black this acts like an eraser :D just sayin."
		);
	} else {
		colorSet = true;
		storedColor = [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x18,
			0x0b,
			0x6f,
			parseInt(0.2126 * parseInt(data["r"], 16), 16),
			parseInt(0.7152 * parseInt(data["g"]), 16),
			parseInt(0.0722 * parseInt(data["b"]), 16),
			0xf7,
		];
		console.log("SYSTEM >> Saved Color and is ready to use");
	}
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	index = 1;
	finalresult = {};
	result.forEach(function (entry) {
		finalresult[index - 1] = Math.round(parseInt(entry, 16) / 4.04);
		index++;
	});
	return result
		? {
				r: finalresult[1].toString(16),
				g: finalresult[2].toString(16),
				b: finalresult[3].toString(16),
		  }
		: null;
}
navigator
	.requestMIDIAccess({
		sysex: true,
	})
	.then(onMIDISuccess, onMIDIFailure);

function ready() {
	buttons = document.getElementsByClassName("launch-pad-button");
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
		console.log("Click!");
	}, false);
}
	(function () {
		if (!console) {
			console = {};
		}
		var old = console.log;
		var logger = document.getElementById("console-output");
		console.log = function (message) {
			old(message);
			if (typeof message == "object") {
				logger.innerHTML +=
					(JSON && JSON.stringify ? JSON.stringify(message) : String(message)) +
					"<br />" +
					message +
					" <br />";
				logger.scrollTop = logger.scrollHeight - logger.clientHeight;
			} else {
				logger.innerHTML += message + "<br />";
				logger.scrollTop = logger.scrollHeight - logger.clientHeight;
			}
		};
	})();
}
function setPulse() {
	if (pulse) {
		pulse = false;
		console.log("Pulsing LED's disabled!");
	} else {
		pulse = true;
		console.log("Pulsing LED's enabled!");
	}
}
function openManual() {
	window.open(
		"https://d2xhy469pqj8rc.cloudfront.net/sites/default/files/novation/downloads/10529/launchpad-mk2-programmers-reference-guide-v1-02.pdf",
		"_blank"
	);
}
function handleDisplay(note, velocity) {
	nums = parseInt(note.toString(16), 16).toString();
	numberArray = [];
	if (nums.length == 3) {
		nums = (parseInt(note.toString(16), 16) - 12).toString();
	}
	for (i = 0, len = nums.length; i < len; i += 1) {
		if (len == 3 && i == 0) {
			topbutton = true;
			numberArray.push(+(nums.charAt(i) + nums.charAt(i + 1)));
		} else if (len == 3 && i == 1) {
			continue;
		} else {
			numberArray.push(+nums.charAt(i));
		}
	}
	console.log(numberArray);
	if (velocity == 0) {
		document.getElementsByClassName("launch-pad-button")[
			document.getElementsByClassName("launch-pad-button").length -
				numberArray[0] * 10 +
				numberArray[1] +
				numberArray[0] -
				1
			// 7 + 79 = ?
		].style.backgroundColor = "gray";
	} else {
		document.getElementsByClassName("launch-pad-button")[
			document.getElementsByClassName("launch-pad-button").length -
				numberArray[0] * 10 +
				numberArray[1] +
				numberArray[0] -
				1
			// 7 + 79 = ?
		].style.backgroundColor = "blue";
	}
}
function scaleValue(r, g, b) {
	redBrightness = (63 * (r - 0)) / (255 - 0);
	greenBrightness = (63 * (b - 0)) / (255 - 0);
	blueBrightness = (63 * (g - 0)) / (255 - 0);
	return { r: redBrightness, g: greenBrightness, b: blueBrightness };
}
