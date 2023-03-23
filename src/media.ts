import EventTarget from "./eventTarget";
import { Env } from "./env";

// 录音、录像、录屏
type MediaType = "audio" | "video" | "screen";

// 只需要记住：把输入 stream 存放在 blobList，最后转预览 blobUrl。
class Media extends EventTarget {
	private medisStream: MediaStream | null = null;
	private mediaRecorder: MediaRecorder | null = null;
	private mediaBlobs: Blob[] = [];

	// 0 未开始  1 等待ctx激活 2 已激活ctx激活未录音
	private mediaState: number = 0;

	private mediaStreamConstraints: MediaStreamConstraints | null = null;

	private mediaRecorderOptions: MediaRecorderOptions | null = null;

	private mediaType: MediaType;

	private timeslice: number | null = null;

	constructor(mediaType: MediaType) {
		super();
		this.setMediaType(mediaType);
	}

	setTimeslice(timeslice: number) {
		timeslice && (this.timeslice = timeslice);
		return this;
	}

	getTimeslice() {
		return this.timeslice;
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
		// let options = {};
		// let constraints = {};
		// if (mediaType === "screen") {
		// 	constraints = {
		// 		video: true,
		// 		audio: true,
		// 	};
		// 	options = {
		// 		audioBitsPerSecond: 128000,
		// 		videoBitsPerSecond: 2500000,
		// 		mimeType: "video/mp4",
		// 	};
		// } else if (mediaType === "video") {
		// 	constraints = {
		// 		video: true,
		// 		audio: true,
		// 	};
		// 	options = {
		// 		audioBitsPerSecond: 128000,
		// 		videoBitsPerSecond: 2500000,
		// 		mimeType: "video/mp4",
		// 	};
		// } else if (mediaType === "audio") {
		// 	options = {
		// 		audioBitsPerSecond: 128000,
		// 		mimeType: "audio/webm",
		// 	};
		// 	constraints = {
		// 		audio: true,
		// 	};
		// }
		// this.setMediaStreamConstraints(constraints);
		// this.setMediaRecorderOptions(options);
		this.mediaType = mediaType;

		return this;
	}

	getMedisStream(): MediaStream | null {
		return this.medisStream;
	}

	async setMedisStream(constraints?: MediaStreamConstraints) {
		this.setMediaStreamConstraints(constraints);
		const _constraints = this.getMediaStreamConstraints();
		try {
			this.medisStream = await navigator.mediaDevices.getUserMedia(
				_constraints,
			);
			return this;
		} catch (err) {
			this.setMediaState(0);
			this.emit("error", "setMedisStream", err);
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

		this.mediaRecorder.onerror = (event: any) => {
			this.emit("error", "mediaRecorder", event);
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

	getMediaState(): number {
		return this.mediaState;
	}

	private setMediaState(mediaState: number) {
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

	isOpen() {
		try {
			const mediaState = this.getMediaState();
			if (mediaState !== 2) {
				throw new Error(
					`the cureent mediaState is ${mediaState}, Please use open function`,
				);
			}
			if (!Env.isBrowserSupported()) {
				throw new Error(
					`the current browser version is too low. Please upgrade your browser`,
				);
			}
		} catch (err) {
			this.emit("error", "isOpen", err);
		}
	}

	onerror(callback?: Function) {
		callback && this.on("error", callback);
	}

	// 创建
	async create() {
		if (this.getMediaState() === 0) {
			this.setMediaState(1);
			await this.setMedisStream();
			this.setMediaRecorder();
			this.setMediaState(2);
			this.emit("create");
			return this;
		} else {
			this.emit("error", "create", `mediaState: ${this.getMediaState()}`);
		}
	}

	oncreate(callback?: Function) {
		callback && this.on("create", callback);
	}

	// 销毁
	destroy() {
		if (this.getMediaState() !== 0) {
			this.getRecorderState() !== "inactive" && this.stop();
			this.medisStream?.getTracks().forEach((track) => track.stop());
			this.mediaBlobs = [];
			this.medisStream = null;
			this.mediaRecorder = null;
			this.setMediaState(0);
			this.emit("destroy");
			return this;
		} else {
			this.emit("error", "destroy", `mediaState: ${this.getMediaState()}`);
		}
	}

	ondestroy(callback?: Function) {
		callback && this.on("destroy", callback);
	}

	ondataavailable(callback?: Function) {
		callback && this.on("dataavailable", callback);
	}

	// 开始
	start(timeslice?: number) {
		this.isOpen();
		try {
			this.setTimeslice(timeslice);
			timeslice = this.getTimeslice();
			timeslice
				? this.mediaRecorder?.start(timeslice)
				: this.mediaRecorder?.start();
			return this;
		} catch (err) {
			this.emit("error", "start", err);
		}
	}

	onstart(callback?: Function) {
		callback && this.on("start", callback);
	}

	stop() {
		this.isOpen();
		try {
			this.mediaRecorder?.stop();
			return this;
		} catch (err) {
			this.emit("error", "stop", err);
		}
	}

	onstop(callback?: Function) {
		callback && this.on("stop", callback);
	}

	// 暂停
	pause() {
		this.isOpen();
		try {
			this.mediaRecorder?.pause();
			return this;
		} catch (err) {
			this.emit("error", "pause", err);
		}
	}

	onpause(callback?: Function) {
		callback && this.on("pause", callback);
	}

	// 继续
	resume() {
		this.isOpen();
		try {
			this.mediaRecorder?.resume();
			return this;
		} catch (err) {
			this.emit("error", "resume", err);
		}
	}

	onresume(callback?: Function) {
		callback && this.on("resume", callback);
	}

	getBlob(options?: BlobPropertyBag): Blob {
		this.isOpen();
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
	getBlobUrl(options?: BlobPropertyBag) {
		this.isOpen();
		try {
			const blob = this.getBlob(options);
			const mediaUrl = URL.createObjectURL(blob);
			return mediaUrl;
		} catch (err) {
			this.emit("error", "getBlobUrl", err);
		}
	}

	// 获取时长
	getDuration(blob?: Blob) {
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
						const duration = buffer.duration;
						resolve(duration);
					},
					(err) => {
						_this.emit("error", "getDuration", `getDuration function is err`);
						reject(err);
					},
				);
			};

			reader.readAsArrayBuffer(blob);
		});
	}

	async _enumerateDevices() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			return devices;
		} catch (err) {
			this.emit("error", "_enumerateDevices", err);
		}
	}
}

export { Media };

export default Media;
