import { Media, audio, video, screen } from "./exports";
import { Env } from "./env";
import { version } from "../package.json";

(<any>window).mediajs = {
	Media,
	audio,
	video,
	screen,
	Env,
	version,
};
/** @deprecated Should use mediajs namespace */
// (<any>window).Media = Media;
