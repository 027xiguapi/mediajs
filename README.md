# media.js | [Live Demo](https://github.com/027xiguapi/mediajs)

**【[源 GitHub 仓库](https://github.com/027xiguapi/mediajs)】 | 【[Gitee 镜像库](https://gitee.com/027xiguapi/mediajs)】如果本文档图片没有显示，请手动切换到 Gitee 镜像库阅读文档。**

**Media JavaScript Library for Audio+Video+Screen Recording**

[![npm](https://img.shields.io/npm/v/mediajs.svg)](https://npmjs.org/package/mediajs) [![downloads](https://img.shields.io/npm/dm/mediajs.svg)](https://npmjs.org/package/mediajs)

<p align="center"><a href="https://github.com/xiangyuecn/Recorder"><img width="100" src="https://xiangyuecn.gitee.io/recorder/assets/icon.png" alt="Recorder logo"></a></p>

<p align="center">
  Basic:
  <a title="Stars" href="https://github.com/xiangyuecn/Recorder"><img src="https://img.shields.io/github/stars/xiangyuecn/Recorder?color=0b1&logo=github" alt="Stars"></a>
  <a title="Forks" href="https://github.com/xiangyuecn/Recorder"><img src="https://img.shields.io/github/forks/xiangyuecn/Recorder?color=0b1&logo=github" alt="Forks"></a>
  <a title="npm Version" href="https://www.npmjs.com/package/recorder-core"><img src="https://img.shields.io/npm/v/recorder-core?color=0b1&logo=npm" alt="npm Version"></a>
  <a title="License" href="https://github.com/xiangyuecn/Recorder/blob/master/LICENSE"><img src="https://img.shields.io/github/license/xiangyuecn/Recorder?color=0b1&logo=github" alt="License"></a>
</p>
<p align="center">
  Traffic:
  <a title="npm Downloads" href="https://www.npmjs.com/package/recorder-core"><img src="https://img.shields.io/npm/dt/recorder-core?color=f60&logo=npm" alt="npm Downloads"></a>
  <a title="cnpm" href="https://npmmirror.com/package/recorder-core"><img src="https://img.shields.io/badge/-cnpm-555" alt="cnpm"></a><a title="cnpm" href="https://npmmirror.com/package/recorder-core"><img src="https://npmmirror.com/badge/d/recorder-core.svg" alt="cnpm"></a>
  <a title="JsDelivr CDN" href="https://www.jsdelivr.com/package/gh/xiangyuecn/Recorder"><img src="https://img.shields.io/badge/CDN-JsDelivr-f60" alt="JsDelivr CDN"></a>
  <a title="unpkg CDN" href="https://unpkg.com/recorder-core/"><img src="https://img.shields.io/badge/CDN-unpkg-f60" alt="unpkg CDN"></a>
</p>

# Getting Started

## Documentation

You can find for more details, API, and other docs on [media.js](https://github.com/027xiguapi/mediajs) website.

## Installation

npm:

```javascript
npm install mediajs --save
```

yarn:

```javascript
yarn add mediajs --save
```

```js
// The usage -
import { audio, video, screen } from "mediajs";
```

## CDN

```html
<!-- global -->
<script src="https://github.com/027xiguapi/mediajs"></script>
```

## Setup

**A demo using audio:**

```javascript
const audio = mediajs.audio();
audio.create();
```

**A demo using video:**

```javascript
const video = mediajs.video();
video.create();
```

**A demo using screen :**

```javascript
const screen = mediajs.screen();
screen.create();
```

## SoundMeter

```javascript
soundMeter.prototype = {
	// return recording instant value
	getInstant: function () {},

	// return recording slow value
	getSlow: function () {},

	// return recording clip value
	getClip: function () {},
};
```

## Function

```javascript
mediajs.prototype = {
	// create the recording
	create: async function () {},

	// destroy the recording
	destroy: function () {},

	// start the recording
	start: function () {},

	// stop the recording
	stop: function () {},

	// pause the recording
	pause: function () {},

	// resume the recording
	resume: function () {},

	// return recorded Blob
	getBlob: function () {},

	// download recorded Blob
	downloadBlob: function (filename) {},

	// return recorded Blob-Url
	getBlobUrl: function () {},

	// return recorded duration (ms)
	getDuration: function () {},

	// return media state ("inactive" | "wait" | "ready")
	getMediaState: function () {},

	// return media type ("audio" | "video" | "screen")
	getMediaType: function () {},

	// return media stream
	getMedisStream: function () {},

	// return Recorder state ("inactive" | "paused" | "recording")
	getRecorderState: function () {},

	// return SoundMeter
	getSoundMeter: function () {},

	// return timeSlice (ms)
	getTimeSlice: function () {},

	// return boolean, which is true if media state is ready
	isReady: function () {},

	// return a list of the available media input and output devices
	_enumerateDevices: async function () {},

	// returns a Boolean which is true if the MIME type specified is one the user agent should be able to successfully record.
	_isTypeSupported: function (mimeType) {},
};
```

## Callback Function

```javascript
media
	.onerror((err) => {
		console.log(err);
	})
	.oncreate(() => {
		const stream = audio.getMedisStream();
		console.log(stream);
	})
	.ondestroy(() => {
		console.log("destroy");
	})
	.onstart(() => {
		console.log("start");
	})
	.onstop(() => {
		console.log("stop");
	})
	.onpause(() => {
		console.log("pause");
	})
	.onresume(() => {
		console.log("resume");
	})
	.ondataavailable(() => {
		console.log("dataavailable");
	});
```

## Configuration

**audio:**

```javascript
{
	audio: boolean | MediaTrackConstraints;
	mimeType: string;
	audioBitsPerSecond: number;
	sampleRate: number;
	timeSlice: number;
	echoCancellation: boolean;
}
```

**video and screen:**

```javascript
{
	audio: boolean | MediaTrackConstraints;

	video: boolean | MediaTrackConstraints;

	// audio/webm
	// audio/webm;codecs=pcm
	// video/mp4
	// video/webm;codecs=vp9
	// video/webm;codecs=vp8
	// video/webm;codecs=h264
	// video/x-matroska;codecs=avc1
	// video/mpeg -- NOT supported by any browser, yet
	// audio/wav
	// audio/ogg  -- ONLY Firefox
	mimeType: string;

	// only for audio track
	// ignored when codecs=pcm
	audioBitsPerSecond: number;

	// used by StereoAudioRecorder
	// the range 22050 to 96000.
	sampleRate: number;

	// get intervals based blobs, value in milliseconds
	timeSlice: number;

	// Echo cancellation
	echoCancellation: boolean;

	// only for video track
	videoBitsPerSecond: number;
	width: number;
	height: number;
	pan: boolean;
	tilt: boolean;
	zoom: boolean;
}
```

## Env APIs

```javascript
mediajs.Env = {
	isIOS: boolean,
	minChromeVersion: number,
	minFirefoxVersion: number,
	minSafariVersion: number,
	supportedBrowsers: array,
    prototype = {
        getBrowser: function() {},
        getVersion: function() {},
        isAudioContextSupported: function() {},
        isAudioWorkletNode: function() {},
        isBrowserSupported: function() {},
        isGetUserMediaSupported: function() {},
        isMediaDevicesSupported: function() {},
        isMediaRecorderSupported: function() {},
        isUnifiedPlanSupported: function() {},
        toString: function() {},
    }
};
```

## Browsers Support

| Browser       | Operating System                   | Features               |
| ------------- | ---------------------------------- | ---------------------- |
| Google Chrome | Windows + macOS + Ubuntu + Android | audio + video + screen |
| Firefox       | Windows + macOS + Ubuntu + Android | audio + video + screen |
| Opera         | Windows + macOS + Ubuntu + Android | audio + video + screen |
| Edge (new)    | Windows (7 or 8 or 10) and MacOSX  | audio + video + screen |
| Safari        | macOS + iOS (iPhone/iPad)          | audio + video          |

## Wiki

- [https://github.com/027xiguapi/mediajs/wiki](https://github.com/027xiguapi/mediajs/wiki)

## Releases

- [https://github.com/027xiguapi/mediajs/releases](https://github.com/027xiguapi/mediajs/releases)

## Unit Tests

- [https://travis-ci.org/muaz-khan/RecordRTC](https://travis-ci.org/muaz-khan/RecordRTC)

## Issues/Questions?

- Github: [https://github.com/027xiguapi/mediajs/issues](https://github.com/027xiguapi/mediajs/issues)

## Spec & Reference

1. [MediaRecorder API](https://w3c.github.io/mediacapture-record/MediaRecorder.html)
2. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
3. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

## Who is using RecordRTC?

| Framework | Github | Article |
| --------- | ------ | ------- |
| React.js  | None   | None    |
| Vue.js    | None   | None    |

## License

[mediajs](https://github.com/027xiguapi/mediajs) is released under [MIT license](https://github.com/027xiguapi/mediajs/blob/master/LICENSE) . Copyright (c).
