import EventTarget from "./eventTarget";
import SoundMeter from "./soundMeter";
import { Env } from "./env";

// 录音、录像、录屏
type MediaType = "audio" | "video" | "screen";

// 只需要记住：把输入 stream 存放在 blobList，最后转预览 blobUrl。
class Media extends EventTarget {
	private medisStream: MediaStream | null = null;
	private mediaRecorder: MediaRecorder | null = null;
	private mediaBlobs: Blob[] = [];
	private soundMeter: SoundMeter | null = null;

	// 0 未开始  1 等待ctx激活 2 已激活ctx激活未录音
	private mediaState: number = 0;

	private mediaStreamConstraints: MediaStreamConstraints | null = null;

	private mediaRecorderOptions: MediaRecorderOptions | null = null;

	private mediaType: MediaType;

	private timeslice: number | null = null;

	constructor(mediaType: MediaType) {
		super();
		if (Env.isUnifiedPlanSupported()) {
			this.setMediaType(mediaType);
		} else {
			this.emit("error", { type: "constructor", message: `${Env.toString()}` });
		}
	}

	setTimeslice(timeslice: number) {
		timeslice && (this.timeslice = timeslice);
		return this;
	}

	getTimeslice() {
		return this.timeslice;
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

		// const possibleTypes = [
		// 	"video/webm;codecs=vp9,opus",
		// 	"video/webm;codecs=vp8,opus",
		// 	"video/webm;codecs=h264,opus",
		// 	"video/mp4;codecs=h264,aac",
		// ];

		return possibleTypes.filter((mimeType) => {
			return MediaRecorder.isTypeSupported(mimeType);
		});
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
		this.setMediaState(1);
		try {
			this.medisStream =
				mediaType === "screen"
					? await navigator.mediaDevices.getDisplayMedia(_constraints)
					: await navigator.mediaDevices.getUserMedia(_constraints);
			this.setMediaState(2);
			this.setSoundMeter();
			return this;
		} catch (err) {
			this.setMediaState(0);
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

	isReady(type: string = "isReady"): boolean {
		const mediaState = this.getMediaState();
		if (mediaState === 2) {
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
		if (this.getMediaState() === 0) {
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
	start(timeslice?: number) {
		if (!this.isReady()) return this;
		try {
			this.setTimeslice(timeslice);
			timeslice = this.getTimeslice();
			timeslice
				? this.mediaRecorder?.start(timeslice)
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

	setSoundMeter() {
		try {
			const audioContext = new AudioContext();
			// const sourceNode = audioContext.createMediaStreamSource(this.medisStream);
			// sourceNode.connect(audioContext.destination);
			this.soundMeter = new SoundMeter(audioContext);
			// const sourceNode = new MediaStreamAudioSourceNode(audioContext, {
			// 	mediaStream: this.medisStream,
			// });
			// sourceNode.connect(audioContext.destination);

			// const inputStream = audioContext.createMediaStreamSource(
			// 	this.medisStream,
			// );
			// const analyserNode = audioContext.createAnalyser();
			// analyserNode.fftSize = 2048;
			// inputStream.connect(analyserNode);

			this.soundMeter.connectToSource(this.medisStream);
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
}

export { Media };

export default Media;
