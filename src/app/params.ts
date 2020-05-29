import { UP, DOWN } from "./keys";

const blue = "#3b9fef";
const pink = "#cc4ff1";
const green = "#2be384";
const green2 = "#02B07C";
const purple = "#9557EF";

const belugaHead = "beluga";
const boltTail = "bolt";
const gogglesHead = "bwc-ski";

export const API_VERSION = 1;
export const Y_DIRECTION = API_VERSION >= 1 ? UP : DOWN;

// logging
export const DEBUG = true;
export const STATUS = true;
export const DEBUG_MAPS = true;
export const CONSOLE_LOG = true;

// my snake meta details
export const MY_SNAKE = {
    HEAD_DESIGN: gogglesHead,
    TAIL_DESIGN: boltTail,
    COLOR: purple,
    FRIENDS: [/zerocool/, /denosnake/, /crashoverride/],
    API_VERSION: API_VERSION.toString(),
    AUTHOR: "tyrelh"
};
