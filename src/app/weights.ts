// game weights
export const SURVIVAL_MIN_HEALTH = 33;
export const LONG_GAME_HEALTH_RESILIENCY = 500;
export const SAME_NUMBER_OF_SNAKES = 4;

// basic space weights

export const BASE_WEIGHT = {
    FORGET_ABOUT_IT: -200,
    SPACE: 0.9,
    FOOD: 0.4,
    TAIL: 12.3,
    KILL_ZONE: 4.5,
    WALL_NEAR: -0.4,
    WARNING: -2.6,
    FUTURE_2: -0.7,
    SMALL_DANGER: -11.0,
    ENEMY_HEAD: -5.9,
    DANGER: -12
}
export const BASE_MULTIPLIER = {
    KILL_ZONE: 1.3,
    WALL_NEAR: 6.5
}

export const MULTIPLIER = {
    HUNGER_URGENCY: 0.4,
    TAIL_DISTANCE: 2.0,
    WALL_DISTANCE: 1.0, // started @ 2.2 --
    WALL_NEAR_FILL: -0.5,
    DANGER_FILL: 0.06,
    TIGHT_MOVE: 1.0 // started @ 2.8 --
}

export const DECAY = {
    FOOD_DISTANCE: 2.8,
    TAIL_DISTANCE: 2.0,
}

export const EXPONENT = {
    HUNT_KILLZONE_DISTANCE: 0.65,
    HUNT_FUTURE2_DISTANCE: 0.4,
    ENEMY_HEAD_DISTANCE: 0.9,
    KILL_ZONE_DISTANCE: 0.8
}