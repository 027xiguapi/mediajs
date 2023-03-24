import { Media } from "./media";

/**
 * 录音参数
 * mimeType 保存数据格式
 * audioBitsPerSecond 比特率
 * sampleRate 采样率
 * timeslice 间隔时间(ms)
 *
 */
interface AudioOption {
	mimeType?: string;
	audioBitsPerSecond?: number;
	sampleRate?: number;
	timeslice?: number;
}

function audio(option?: AudioOption) {
	const { mimeType, audioBitsPerSecond, sampleRate, timeslice } = option || {};
	const audio = new Media("audio")
		.setMediaStreamConstraints({ audio: { sampleRate: sampleRate } })
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: audioBitsPerSecond,
		})
		.setTimeslice(timeslice);

	return audio;
}

interface VideoOption extends AudioOption {
	audio?: boolean | MediaTrackConstraints;
	videoBitsPerSecond?: number;
}

function video(option?: VideoOption) {
	const {
		audio,
		mimeType,
		audioBitsPerSecond,
		videoBitsPerSecond,
		sampleRate,
		timeslice,
	} = option || {};
	const video = new Media("video")
		.setMediaStreamConstraints({ video: { sampleRate: sampleRate }, audio })
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: audioBitsPerSecond,
			videoBitsPerSecond: videoBitsPerSecond,
		})
		.setTimeslice(timeslice);
	return video;
}

function screen() {
	const screen = new Media("screen");
	return screen;
}

export { Media, audio, video, screen };
export default Media;
