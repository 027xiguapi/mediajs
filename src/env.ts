import webRTCAdapter_import from "webrtc-adapter";

const webRTCAdapter: typeof webRTCAdapter_import =
	//@ts-ignore
	webRTCAdapter_import.default || webRTCAdapter_import;

export const Env = new (class {
	readonly isIOS = ["iPad", "iPhone", "iPod"].includes(navigator.platform);
	readonly supportedBrowsers = ["firefox", "chrome", "safari"];

	readonly minFirefoxVersion = 59;
	readonly minChromeVersion = 72;
	readonly minSafariVersion = 605;

	isAudioContextSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isMediaDevicesSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isGetUserMediaSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isScriptProcessorSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isAudioWorkletSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isWebRTCSupported(): boolean {
		return typeof navigator.mediaDevices.getUserMedia !== "undefined";
	}

	isBrowserSupported(): boolean {
		const browser = this.getBrowser();
		const version = this.getVersion();

		const validBrowser = this.supportedBrowsers.includes(browser);

		if (!validBrowser) return false;

		if (browser === "chrome") return version >= this.minChromeVersion;
		if (browser === "firefox") return version >= this.minFirefoxVersion;
		if (browser === "safari")
			return !this.isIOS && version >= this.minSafariVersion;

		return false;
	}

	getBrowser(): string {
		return webRTCAdapter.browserDetails.browser;
	}

	getVersion(): number {
		return webRTCAdapter.browserDetails.version || 0;
	}

	isUnifiedPlanSupported(): boolean {
		const browser = this.getBrowser();
		const version = webRTCAdapter.browserDetails.version || 0;

		if (browser === "chrome" && version < this.minChromeVersion) return false;
		if (browser === "firefox" && version >= this.minFirefoxVersion) return true;
		if (!navigator.mediaDevices.getUserMedia) return false;

		return true;
	}

	toString(): string {
		return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;

		// 	AudioContext:true
		// webkitAudioContext:false
		// mediaDevices:true
		// mediaDevices.getUserMedia:true
		// navigator.getUserMedia:true
		// navigator.webkitGetUserMedia:true
		// AudioContext.scriptProcessor:true
		// AudioContext.audioWorklet:true
		// AudioWorkletNode:true
		// MediaRecorder:true
		// MediaRecorder.ondataavailable:true
		// MediaRecorder.WebM.PCM:true
	}
})();
