import { Media } from "./media";

/**
 * 录音参数
 * mimeType 保存数据格式
 * bitsPerSecond 比特率
 * sampleRate 采样率
 * timeslice 间隔时间(ms)
 *
 */
interface AudioOption {
	mimeType?: string;
	bitsPerSecond?: number;
	sampleRate?: number;
	timeslice?: number;
}

function audio(option?: AudioOption) {
	const { mimeType, bitsPerSecond, sampleRate, timeslice } = option || {};
	const audio = new Media("audio")
		.setMediaStreamConstraints({ audio: { sampleRate: sampleRate } })
		.setMediaRecorderOptions({
			mimeType: mimeType,
			audioBitsPerSecond: bitsPerSecond,
		})
		.setTimeslice(timeslice);

	return audio;
}

function video() {
	const video = new Media("video");
	return video;
}

function screen() {
	const screen = new Media("screen");
	return screen;
}

export { Media, audio, video, screen };
export default Media;
