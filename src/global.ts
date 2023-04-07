import { audio, video, screen } from "./exports";
import { Env } from "./env";
import { version } from "../package.json";

(<any>window).mediajs = {
	audio,
	video,
	screen,
	Env,
	version,
};
/** @deprecated Should use mediajs namespace */
