// board spaces
export const KILL_ZONE = 0;
export const SPACE = 1;
export const TAIL = 2;
export const FOOD = 3;
export const FUTURE_2 = 4;
export const WALL_NEAR = 5;
export const WARNING = 6;
export const SMALL_DANGER = 7;
export const DANGER = 8;
export const SNAKE_BODY = 9;
export const YOUR_BODY = 10;
export const SMALL_HEAD = 11;
export const ENEMY_HEAD = 12;
export const TYPE = [
    "KILL_ZONE",
    "SPACE",
    "TAIL",
    "FOOD",
    "FUTURE_2",
    "WALL_NEAR",
    "WARNING",
    "SMALL_DANGER",
    "DANGER",
    "SNAKE_BODY",
    "YOUR_BODY",
    "SMALL_HEAD",
    "ENEMY_HEAD"
];
//                            0    1    2    3    4    5    6    7    8    9    10   11   12   13
export const GRID_SYMBOLS = ["!", " ", "T", "o", ".", "*", "w", "x", "X", "s", "Y", "S", "E", "@"];

// behaviours
export const EATING = 0;
export const KILLING_TIME = 1;
export const HUNTING = 2;
export const LATE_HUNTING = 3;
export const EATING_EMERGENCY = 4;
export const BEHAVIOURS = [
    "EATING",
    "KILLING_TIME",
    "HUNTING",
    "LATE_HUNTING",
    "EATING_EMERGENCY"
];

// directions
export const DIRECTION = ["up", "down", "left", "right"];
export const DIRECTION_ICON = ["⬆️", "⬇️", "⬅️", "➡️"];
export const UP = 0;
export const DOWN = 1;
export const LEFT = 2;
export const RIGHT = 3;
export const DIRECTIONS = [0, 1, 2, 3];
