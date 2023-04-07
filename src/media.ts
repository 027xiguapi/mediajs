import EventTarget from "./eventTarget";
import SoundMeter from "./soundMeter";
import { Env } from "./env";
import type {
	MediaType,
	MediaState,
	AudioOption,
	VideoOption,
	ScreenOption,
} from "./type";

class Media extends EventTarget {
	private medisStream: MediaStream | null = null;

	private mediaRecorder: MediaRecorder | null = null;

	private mediaBlobs: Blob[] = [];

	private soundMeter: SoundMeter | null = null;

	private mediaState: MediaState = "inactive";

	private mediaStreamConstraints: MediaStreamConstraints | null = null;

	private mediaRecorderOptions: MediaRecorderOptions | null = null;

	private mediaType: MediaType;

	private timeSlice: number | null = null;

	constructor(
		mediaType: MediaType,
		option?: AudioOption | VideoOption | ScreenOption,
	) {
		super();
		if (Env.isUnifiedPlanSupported()) {
			this.setMediaType(mediaType).setConfig(option);
		} else {
			this.emit("error", { type: "constructor", message: `${Env.toString()}` });
		}
	}

	setConfig(option?: AudioOption | VideoOption | ScreenOption) {
		switch (this.mediaType) {
			case "audio":
				this.setAudioConfig(option);
				break;

			case "video":
				this.setVideoConfig(option);
				break;

			case "screen":
				this.setScreenConfig(option);
				break;
		}

		return this;
	}

	getAudioConstraints(option) {
		let { audio, sampleRate, echoCancellation } = option || {};

		if (
			typeof sampleRate === "undefined" &&
			typeof echoCancellation === "undefined"
		) {
			audio || (audio = true);
		} else {
			audio = {};
			sampleRate && (audio["sampleRate"] = sampleRate);
			echoCancellation &&
				(audio["echoCancellation"] = { exact: echoCancellation });
		}

		return audio;
	}

	getVideoConstraints(option) {
		let { video, sampleRate, width, height } = option || {};

		if (
			typeof sampleRate === "undefined" &&
			typeof width === "undefined" &&
			typeof height === "undefined"
		) {
			video || (video = true);
		} else {
			video = {};
			sampleRate && (video["sampleRate"] = sampleRate);
			width && (video["width"] = width);
			height && (video["height"] = height);
		}

		return video;
	}

	getConfigOptions(option) {
		let { mimeType, audioBitsPerSecond, videoBitsPerSecond } = option || {};
		let options = {
			mimeType:
				mimeType || (this.mediaType === "audio" ? "audio/webm" : "video/webm"),
		};
		audioBitsPerSecond && (options["audioBitsPerSecond"] = audioBitsPerSecond);
		videoBitsPerSecond && (options["videoBitsPerSecond"] = videoBitsPerSecond);

		return options;
	}

	setAudioConfig(option: AudioOption) {
		let audio = this.getAudioConstraints(option);
		let options = this.getConfigOptions(option);

		this.setMediaStreamConstraints({ audio })
			.setMediaRecorderOptions(options)
			.setTimeSlice(option.timeSlice);

		return this;
	}

	setVideoConfig(option: VideoOption) {
		let audio = this.getAudioConstraints(option);
		let video = this.getVideoConstraints(option);
		let options = this.getConfigOptions(option);

		this.setMediaStreamConstraints({ video, audio })
			.setMediaRecorderOptions(options)
			.setTimeSlice(option.timeSlice);

		return this;
	}

	setScreenConfig(option: ScreenOption) {
		let audio = this.getAudioConstraints(option);
		let video = this.getVideoConstraints(option);
		let options = this.getConfigOptions(option);

		this.setMediaStreamConstraints({ video, audio })
			.setMediaRecorderOptions(options)
			.setTimeSlice(option.timeSlice);

		return this;
	}

	setTimeSlice(timeSlice: number) {
		timeSlice && (this.timeSlice = timeSlice);
		return this;
	}

	getTimeSlice() {
		return this.timeSlice;
	}

	getMediaType() {
		return this.mediaType;
	}

	/**
	 * 
	 * @param setMediaType 
	 * audio: 录音 Boolean;
		video: 录像 Boolean;
		screen: 录屏 Boolean;
	 * @returns 
	 */
	setMediaType(mediaType: MediaType) {
		this.mediaType = mediaType;

		return this;
	}

	getMedisStream(): MediaStream | null {
		return this.medisStream;
	}

	async setMedisStream(constraints?: MediaStreamConstraints) {
		this.setMediaStreamConstraints(constraints);
		const _constraints = this.getMediaStreamConstraints();
		const mediaType = this.getMediaType();
		this.setMediaState("wait");
		try {
			this.medisStream =
				mediaType === "screen"
					? await navigator.mediaDevices.getDisplayMedia(_constraints)
					: await navigator.mediaDevices.getUserMedia(_constraints);
			this.setMediaState("ready");
			this.setSoundMeter();
			return this;
		} catch (err) {
			this.setMediaState("inactive");
			this.emit("error", { type: "setMedisStream", message: err });
		}
	}

	getMediaRecorder(): MediaRecorder | null {
		return this.mediaRecorder;
	}

	setMediaRecorder(options?: MediaRecorderOptions) {
		this.setMediaRecorderOptions(options);
		this.mediaRecorder = new MediaRecorder(
			this.medisStream,
			this.getMediaRecorderOptions(),
		);

		this.mediaRecorder.onerror = (err: any) => {
			this.emit("error", { type: "mediaRecorder", message: err });
		};

		// 将 stream 转成 blob 来存放
		this.mediaRecorder.ondataavailable = (blobEvent: BlobEvent) => {
			this.emit("dataavailable", blobEvent);
			this.mediaBlobs.push(blobEvent.data);
		};

		this.mediaRecorder.onstart = (event: any) => {
			this.mediaBlobs = [];
			this.emit("start", event);
		};

		this.mediaRecorder.onstop = (event: any) => {
			this.soundMeter.stop();
			this.emit("stop", event);
		};

		this.mediaRecorder.onpause = (event: any) => {
			this.emit("pause", event);
		};

		this.mediaRecorder.onresume = (event: any) => {
			this.emit("resume", event);
		};

		return this;
	}

	getMediaBlobs(): Blob[] {
		return this.mediaBlobs;
	}

	getMediaState(): MediaState {
		return this.mediaState;
	}

	private setMediaState(mediaState: MediaState) {
		this.mediaState = mediaState;
		return this;
	}

	// type RecordingState = "inactive" | "paused" | "recording";
	getRecorderState(): string {
		return this.getMediaRecorder()?.state || "inactive";
	}

	getMediaStreamConstraints(): MediaStreamConstraints | null {
		return this.mediaStreamConstraints;
	}

	/**
     *  
     * @param constraints 
     * audio：指定是否获取音频流。
        video：指定是否获取视频流。
        audioConstraints 和 videoConstraints：分别指定音频和视频的约束条件，例如采样率、帧速率等。
        facingMode：指定使用前置或后置摄像头。
        width 和 height：指定视频的宽度和高度。
        frameRate：指定视频的帧速率。
        deviceId：指定要使用的音频或视频设备的 ID。
     * @returns 
     */
	setMediaStreamConstraints(constraints?: MediaStreamConstraints) {
		const _constraints = {
			...this.getMediaStreamConstraints(),
			...constraints,
		};
		this.mediaStreamConstraints = _constraints;
		return this;
	}

	getMediaRecorderOptions(): MediaRecorderOptions | null {
		return this.mediaRecorderOptions;
	}

	/**
     * 
     * @param options 
     * mimeType：指定录制的媒体文件类型，例如 audio/webm、video/webm 等。
        audioBitsPerSecond 和 videoBitsPerSecond：分别指定音频和视频的比特率。
        audioChannels：指定使用的音频通道数。
        videoFrameRate：指定视频的帧速率。
        width 和 height：指定视频的宽度和高度。
        videoSize：指定视频的大小，可以是宽度和高度组成的对象，也可以是字符串（例如“640x480”）。
        echoCancellation：指定是否启用回声消除。
     * @returns 
     */
	setMediaRecorderOptions(options?: MediaRecorderOptions) {
		const _options = { ...this.getMediaRecorderOptions(), ...options };
		this.mediaRecorderOptions = _options;
		return this;
	}

	isReady(type: string = "isReady"): boolean {
		const mediaState = this.getMediaState();
		if (mediaState === "ready") {
			return true;
		} else {
			const err = `the cureent mediaState is ${mediaState}, Please use open function`;
			this.emit("error", { type, message: err });
			return false;
		}
	}

	onerror(callback?: Function) {
		callback && this.on("error", callback);
		return this;
	}

	// 创建
	async create() {
		if (this.getMediaState() === "inactive") {
			const media = await this.setMedisStream();
			if (media) {
				this.setMediaRecorder();
				this.emit("create");
			}
			return this;
		} else {
			this.emit("error", {
				type: "create",
				message: `mediaState: ${this.getMediaState()}`,
			});
		}
	}

	oncreate(callback?: Function) {
		callback && this.on("create", callback);
		return this;
	}

	// 销毁
	destroy() {
		if (this.getMediaState() !== "inactive") {
			this.getRecorderState() !== "inactive" && this.stop();
			this.medisStream?.getTracks().forEach((track) => track.stop());
			this.mediaBlobs = [];
			this.medisStream = null;
			this.mediaRecorder = null;
			this.setMediaState("inactive");
			this.emit("destroy");
			return this;
		} else {
			this.emit("error", {
				type: "destroy",
				message: `mediaState: ${this.getMediaState()}`,
			});
		}
	}

	ondestroy(callback?: Function) {
		callback && this.on("destroy", callback);
		return this;
	}

	ondataavailable(callback?: Function) {
		callback && this.on("dataavailable", callback);
		return this;
	}

	// 开始
	start(timeSlice?: number) {
		if (!this.isReady()) return this;
		try {
			this.setTimeSlice(timeSlice);
			timeSlice = this.getTimeSlice();
			timeSlice
				? this.mediaRecorder?.start(timeSlice)
				: this.mediaRecorder?.start();
			return this;
		} catch (err) {
			this.emit("error", { type: "start", message: err });
		}
	}

	onstart(callback?: Function) {
		callback && this.on("start", callback);
	}

	stop() {
		if (!this.isReady()) return this;
		try {
			this.mediaRecorder?.stop();
			return this;
		} catch (err) {
			this.emit("error", { type: "stop", message: err });
		}
	}

	onstop(callback?: Function) {
		callback && this.on("stop", callback);
		return this;
	}

	// 暂停
	pause() {
		if (!this.isReady()) return this;
		try {
			this.mediaRecorder?.pause();
			return this;
		} catch (err) {
			this.emit("error", { type: "pause", message: err });
		}
	}

	onpause(callback?: Function) {
		callback && this.on("pause", callback);
		return this;
	}

	// 继续
	resume() {
		if (!this.isReady()) return this;
		try {
			this.mediaRecorder?.resume();
			return this;
		} catch (err) {
			this.emit("error", { type: "resume", message: err });
		}
	}

	onresume(callback?: Function) {
		callback && this.on("resume", callback);
		return this;
	}

	setSoundMeter(medisStream?: MediaStream) {
		try {
			const audioContext = new AudioContext();
			this.soundMeter = new SoundMeter(audioContext);
			this.soundMeter.connectToSource(medisStream || this.medisStream);
			return this;
		} catch (err) {
			this.emit("error", { type: "setSoundMeter", message: err });
		}
	}

	getSoundMeter(): SoundMeter {
		return this.soundMeter;
	}

	getBlob(options?: BlobPropertyBag): Blob {
		if (!this.isReady()) return;
		const { mimeType } = this.getMediaRecorderOptions();
		if (!options) {
			options = {
				type: mimeType,
			};
		}

		const blob = new Blob(this.mediaBlobs, options);
		return blob;
	}

	// 获取BlobUrl
	getBlobUrl(options?: BlobPropertyBag): string {
		if (!this.isReady()) return;
		try {
			const blob = this.getBlob(options);
			const mediaUrl = URL.createObjectURL(blob);
			return mediaUrl;
		} catch (err) {
			this.emit("error", { type: "getBlobUrl", message: err });
		}
	}

	downloadBlob(filename) {
		const url = this.getBlobUrl();
		const a = document.createElement("a");
		a.style.display = "none";
		a.href = url;
		a.download = `${filename || "mediajs"}.webm`;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 150);
		return this;
	}

	// 获取时长
	getDuration(blob?: Blob): Promise<number> {
		return new Promise((resolve, reject) => {
			blob = blob || this.getBlob();

			const _this = this;
			const audioContext = new AudioContext();
			const reader = new FileReader();

			reader.onload = function () {
				const arrayBuffer = this.result as ArrayBuffer;
				audioContext.decodeAudioData(
					arrayBuffer,
					(buffer) => {
						const duration = Math.round(buffer.duration * 1000);
						resolve(duration);
					},
					(err) => {
						_this.emit("error", "getDuration", `getDuration function is err`);
						reject(err);
					},
				);
			};

			if (blob) {
				reader.readAsArrayBuffer(blob);
			} else {
				_this.emit("error", "getDuration", `blob is Empty`);
			}
		});
	}

	async _enumerateDevices() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			return devices;
		} catch (err) {
			this.emit("error", { type: "_enumerateDevices", message: err });
		}
	}

	getSupportedMimeTypes() {
		const possibleTypes = [
			"video/webm",
			"audio/webm",
			"video/webm;codecs=vp9",
			"video/webm;codecs=vp8",
			"video/webm;codecs=daala",
			"video/webm;codecs=h264",
			"audio/webm;codecs=opus",
			"video/mp4;codecs=h264",
		];

		return possibleTypes.filter((mimeType) => {
			return this._isTypeSupported(mimeType);
		});
	}

	_isTypeSupported(mimeType: string): boolean {
		return MediaRecorder.isTypeSupported(mimeType);
	}
}

export { Media };

export default Media;
