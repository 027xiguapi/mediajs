import { Media } from "./media";

/**
 * 录音参数
 * mimeType 保存数据格式
 * audioBitsPerSecond 比特率
 * sampleRate 采样率
 * timeslice 间隔时间(ms)
 * echoCancellation 回声处理
 */
interface AudioOption {
	mimeType?: string;
	audioBitsPerSecond?: number;
	sampleRate?: number;
	timeslice?: number;
	echoCancellation?: boolean;
}

function audio(option?: AudioOption) {
	const {
		mimeType,
		audioBitsPerSecond,
		sampleRate,
		timeslice,
		echoCancellation,
	} = option || {};
	const audio = new Media("audio")
		.setMediaStreamConstraints({
			audio: {
				sampleRate: sampleRate,
				echoCancellation: { exact: echoCancellation },
			},
		})
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: audioBitsPerSecond,
		})
		.setTimeslice(timeslice);

	return audio;
}

// pan: 平移, tilt: 倾斜, zoom: 缩放
interface VideoOption extends AudioOption {
	audio?: boolean | MediaTrackConstraints;
	videoBitsPerSecond?: number;
	width?: number;
	height?: number;
	pan?: boolean;
	tilt?: boolean;
	zoom?: boolean;
}

function video(option?: VideoOption) {
	const {
		audio,
		mimeType,
		audioBitsPerSecond,
		videoBitsPerSecond,
		sampleRate,
		timeslice,
		width,
		height,
	} = option || {};
	const video = new Media("video")
		.setMediaStreamConstraints({
			video: { sampleRate, width, height },
			audio,
		})
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: audioBitsPerSecond,
			videoBitsPerSecond: videoBitsPerSecond,
		})
		.setTimeslice(timeslice);
	return video;
}

interface ScreenOption extends VideoOption {}

function screen(option?: ScreenOption) {
	const {
		audio,
		mimeType,
		audioBitsPerSecond,
		videoBitsPerSecond,
		sampleRate,
		timeslice,
		width,
		height,
	} = option || {};
	const screen = new Media("screen")
		.setMediaStreamConstraints({
			video: { sampleRate, width, height },
			audio,
		})
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: audioBitsPerSecond,
			videoBitsPerSecond: videoBitsPerSecond,
		})
		.setTimeslice(timeslice);
	return screen;
}

export { Media, audio, video, screen };
export default Media;
