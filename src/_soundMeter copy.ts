// class SoundMeter {
// 	context;
// 	instant;
// 	slow;
// 	clip;
// 	script;
// 	mic;
// 	constructor(context: AudioContext) {
// 		this.context = context;
// 		this.instant = 0.0;
// 		this.slow = 0.0;
// 		this.clip = 0.0;
// 		this.script = context.createScriptProcessor(2048, 1, 1);
// 		const that = this;
// 		this.script.onaudioprocess = function (event) {
// 			const input = event.inputBuffer.getChannelData(0);
// 			let i;
// 			let sum = 0.0;
// 			let clipcount = 0;
// 			console.log("input", input);
// 			for (i = 0; i < input.length; ++i) {
// 				sum += input[i] * input[i];
// 				if (Math.abs(input[i]) > 0.99) {
// 					clipcount += 1;
// 				}
// 			}
// 			that.instant = Math.sqrt(sum / input.length);
// 			that.slow = 0.95 * that.slow + 0.05 * that.instant;
// 			that.clip = clipcount / input.length;
// 		};
// 	}

// 	connectToSource(stream, callback) {
// 		try {
// 			this.mic = this.context.createMediaStreamSource(stream);
// 			this.mic.connect(this.script);
// 			// necessary to make sample run, but should not be.
// 			this.script.connect(this.context.destination);
// 			if (typeof callback !== "undefined") {
// 				callback(null);
// 			}
// 		} catch (e) {
// 			console.error(e);
// 			if (typeof callback !== "undefined") {
// 				callback(e);
// 			}
// 		}
// 	}

// 	stop() {
// 		console.log("SoundMeter stopping");
// 		this.mic.disconnect();
// 		this.script.disconnect();
// 	}
// }

class SoundMeter {
	private context: AudioContext;
	private script!: AudioWorkletNode;
	private mic!: MediaStreamAudioSourceNode;
	analyserNode;
	constructor(context) {
		this.context = context;
		this.init();
		// this.context.audioWorklet
		// 	.addModule("http://127.0.0.1:5500/dist/worklet.js")
		// 	.then((e) => {
		// 		this.script = new AudioWorkletNode(context, "sound-meter-processor");
		// 		this.script.connect(context.destination);
		// 	});
	}

	private async init() {
		await this.context.audioWorklet.addModule(
			"http://127.0.0.1:5500/dist/worklet.js",
		);
		this.script = new AudioWorkletNode(this.context, "sound-meter-processor");
		this.script.connect(this.context.destination);
	}

	// connectToMic(stream: MediaStream) {
	// 	console.log("MicVolumeNode connecting to mic...");
	// 	const source = this.context.createMediaStreamSource(stream);
	// 	source.connect(this.script);
	// }

	getInstant() {
		this.script.port.onmessage = (e) => console.log(e.data);

		return this.script.port.postMessage({
			type: "instant",
			// analyserNode: this.analyserNode,
		});
	}

	getSlow() {
		return this.script.port.postMessage({ type: "slow" });
	}

	getClip() {
		return this.script.port.postMessage({ type: "clip" });
	}

	connectToSource(stream, callback) {
		console.log("SoundMeter connecting");
		try {
			this.mic = this.context.createMediaStreamSource(stream);
			// this.mic = new MediaStreamAudioSourceNode(this.context, {
			// 	mediaStream: stream,
			// });
			const analyserNode = this.context.createAnalyser();
			this.analyserNode = analyserNode;
			analyserNode.fftSize = 2048;
			this.mic.connect(analyserNode);
			// this.mic.connect(this.script);
			// this.mic.connect(this.context.destination);
			if (typeof callback !== "undefined") {
				callback(null);
			}
		} catch (e) {
			console.error(e);
			if (typeof callback !== "undefined") {
				callback(e);
			}
		}
	}

	stop() {
		console.log("SoundMeter stopping");
		this.mic.disconnect();
		this.script.disconnect();
	}
}

export { SoundMeter };
