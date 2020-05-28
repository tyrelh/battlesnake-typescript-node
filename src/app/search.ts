import { GameRequest, Cell, Snake } from "./types";
import * as log from "./logger";
import { myLocation, isMe } from "./self";
import { cellToString, applyMoveToCell, getDistance, newCell, calcDirection, applyOffsetToCell } from "./utils";
import { State } from "./state";
import { Grid } from "./grid";
import { DANGER, FOOD, KILL_ZONE, ENEMY_HEAD, DIRECTIONS, SMALL_DANGER, SNAKE_BODY, WARNING, FUTURE_2, SMALL_HEAD, TAIL, WALL_NEAR } from "./keys";
import { DECAY, EXPONENT, MULTIPLIER, BASE_WEIGHT } from "./weights";
import { moveInScores, normalizeScores } from "./scores";
import { astar } from "./astar";


/**
 * Get move scores for eating with data from Grid
 * @param urgency 
 * @param state 
 */
export const eatingScoresFromGrid = (urgency: number, state: State): number[] => {
    const foods: Cell[] = state.grid.getAll(FOOD);
    let scores = eatingScoresFromListOfFood(foods, state, urgency);
    if (!moveInScores(scores)) {
        scores = eatingScoresFromState(urgency, state);
    }
    return scores
}


/**
 * Get move scores for eating with data from state
 * @param urgency 
 * @param state 
 */
export const eatingScoresFromState = (urgency: number, state: State): number[] => {
    return eatingScoresFromListOfFood(state.board.food, state, urgency);
}


/**
 * Get move scores for eating for a list of food
 * @param foods 
 * @param state 
 * @param urgency 
 */
export const eatingScoresFromListOfFood = (foods: Cell[], state: State, urgency: number = 1) => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (d: number, _: Cell): number => {
            return (urgency * Math.exp((-Math.abs(d)) / DECAY.FOOD_DISTANCE));
        }
        scores = getScoresForTargets(myLocation(state), foods, scoringFunction, state);
    } catch (e) {
        log.error("EX in search.eatingScoresFromListOfFoods: ", e);
    }
    return scores;
}


/**
 * Get move scores for hunting killzones
 * @param state 
 */
export const huntingScoresForAccessibleKillzones = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (distance: number, startPosition: Cell): number => {
            let score = 0;
            if (state.grid.value(startPosition) >= SMALL_DANGER) {
                score = (Math.pow(distance, EXPONENT.HUNT_KILLZONE_DISTANCE) / 10);
            } else {
                score = Math.pow(distance, EXPONENT.HUNT_KILLZONE_DISTANCE);
            }
            return score;
        }
        const killzones = state.grid.getAll(KILL_ZONE);
        scores = getScoresForTargets(myLocation(state), killzones, scoringFunction, state);
    } catch(e) {
        log.error("EX in search.huntingScoresForAccessableKillzones: ", e);
    }
    return scores;
}


/**
 * Get move scores for hunting future2s
 * @param state 
 */
export const huntingScoresForAccessibleFuture2 = (state: State): number[] => {
    let scores = [0, 0, 0, 0]
    try {
        const scoringFunction = (distance: number, _: Cell): number => {
            return Math.pow(distance, EXPONENT.HUNT_FUTURE2_DISTANCE)
        }
        const future2s = state.grid.getAll(FUTURE_2);
        scores = getScoresForTargets(myLocation(state), future2s, scoringFunction, state);
    } catch(e) {
        log.error("EX in search.huntingScoresForAccessibleFuture2: ", e);
    }
    return scores;
}



export const fartherFromDangerousSnakesBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (distance: number, _: Cell): number => {
            return Math.pow(distance, EXPONENT.ENEMY_HEAD_DISTANCE);
        }
        const dangerousSnakeHeads: Cell[] = [];
        for (let snake of state.board.snakes) {
            if (snake.length >= state.self.length && !isMe(snake, state)) {
                dangerousSnakeHeads.push(snake.head);
            }
        }
        scores = getScoresForTargets(myLocation(state), dangerousSnakeHeads, scoringFunction, state);
    } catch(e) {
        log.error(`EX in search.fartherFromDangerousSnakesBias: ${e}`);
    }
    return normalizeScores(scores) ;
}


export const closerToKillableSnakesBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (distance: number, startCell: Cell): number => {
            return (-Math.pow(distance, EXPONENT.KILL_ZONE_DISTANCE))
        }
        const killzones = state.grid.getAll(KILL_ZONE);
        scores = getScoresForTargets(myLocation(state), killzones, scoringFunction, state);
    } catch(e) {
        log.error(`EX in search.closerToKillableSnakesBias: ${e}`);
    }
    return scores;
}


export const closerToTailsBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (distance: number, _: Cell): number => {
            return (Math.exp(-Math.abs(distance) / DECAY.TAIL_DISTANCE) * MULTIPLIER.TAIL_DISTANCE);
        }
        const tails: Cell[] = [];
        for (let snake of state.board.snakes) {
            if (isMe(snake, state)) {
                tails.push(snake.body[snake.length - 1]);
            }
            tails.push(snake.body[snake.length - 1]);
        }
        scores = getScoresForTargets(myLocation(state), tails, scoringFunction, state);
    } catch (e) {
        log.error(`EX in search.closerToTailBias: ${e}`);
    }
    return scores;
}


/**
 * Get move scores for hunting a list of targets
 * @param targets 
 * @param scoringFunction 
 * @param state 
 */
const getScoresForTargets = (startPosition: Cell, targets: Cell[], scoringFunction: (distance: number, startPosition: Cell) => number, state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        // loop over all targets
        for (let target of targets) {
            // loop through all possible moves
            for (let move of DIRECTIONS) {
                const movePosition = applyMoveToCell(move, startPosition);
                // if move is valid
                if (!state.grid.outOfBounds(movePosition) && state.grid.value(movePosition) < SNAKE_BODY) {
                    let searchResult = astar(movePosition, target, state, SNAKE_BODY, true);
                    // if path is found
                    if (searchResult.success) {
                        scores[move] += scoringFunction(searchResult.distance, startPosition);
                    }
                }
            }
        }
    } catch(e) {
        log.error("EX in search.getHuntingScores: ", e);
    }
    return scores;
}


/**
 * Get move scores for farther from walls bias
 * @param state 
 */
export const fartherFromWallsBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    let minimumScore = 9999;
    try {
        for (let move of DIRECTIONS) {
            const currentDistance = distanceFromWall(applyMoveToCell(move, myLocation(state)), state);
            if (scores[move] < currentDistance) {
                scores[move] = currentDistance * MULTIPLIER.WALL_DISTANCE
                if (scores[move] < minimumScore) {
                    minimumScore = scores[move];
                }
            }
        }
        scores = scores.map((x: number): number => x - minimumScore);
    } catch (e) {
        log.error("EX in search.fartherFromWallsBias", e);
    }
    return scores;
}


/**
 * Calculate the distance from a Cell to the wall
 * @param cell 
 * @param state 
 */
export const distanceFromWall = (cell: Cell, state: State): number => {
    try {
        const yDown = cell.y;
        const yUp = (state.grid.height - 1) - cell.y;
        const xLeft = cell.x;
        const xRight = (state.grid.width - 1) - cell.x;
        const xDistance = Math.min(xLeft, xRight);
        const yDistance = Math.min(yUp, yDown);
        return (xDistance + yDistance);
    }
    catch (e) {
        log.error(`ex in search.distanceFromWall: ${e}`)
    };
    return 0;
}


export const floodBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const myHead = myLocation(state);
        log.status("Performing flood fill searches");
        for (let move of DIRECTIONS) {
            const startPosition = applyMoveToCell(move, myHead);
            if (!state.grid.outOfBounds(startPosition) && state.grid.value(startPosition) < SNAKE_BODY) {
                scores[move] += floodFill(startPosition, state);
                // scores[move] += floodFill(startPosition, state, [KILL_ZONE, DANGER, WARNING, SMALL_DANGER]);
            }
        }
    } catch (e) {
        log.error(`EX in search.floodBias: ${e}`);
    }
    return scores;
}


/**
 * Get a list of opponent head cells
 * @param state 
 */
export const getEnemySnakes = (state: State): Snake[] => {
    // FIXME: tyrelh getEnemyLocations not taking into account friendly names
    const snakes: Snake[] = [];
    for (let snake of state.board.snakes) {
        if (isMe(snake, state)) {
            continue;
        }
        snakes.push(snake);
    }
    return snakes;
}


export const edgeFillFromEnemyToSelf = (enemy: Snake, gridDataCopy: number[][], state: State): number[][] => {
    const enemyMoves: Cell[] = getEnemyMoveLocations(enemy, state);
    for (let enemyMove of enemyMoves) {
        // log.debug(`Doing enemy edge fill for move @ ${cellToString(enemyMove)}`)
        // TODO: tyrelh implement edge flood fill
        log.debug("Skipping edgeFillFromEnemyToSelf, not yet implemented.");
    }
    return gridDataCopy;
}


export const getEnemyMoveLocations = (enemy: Snake, state: State): Cell[] => {
    const positions = [];
    for (let m = 0; m < 4; m++) {
        if (validMove(m, enemy.head, state)) {
            positions.push(applyMoveToCell(m, enemy.head));
        }
    }
    return positions
}


export const tightMoveBias = (state: State): number[] => {
    const scores = [0, 0, 0, 0];
    try {
        for (let move of DIRECTIONS) {
            let nextCell = applyMoveToCell(move, myLocation(state));
            if (!state.grid.outOfBounds(nextCell) && state.grid.value(nextCell) <= DANGER) {
                for (let direction of DIRECTIONS) {
                    let cellToCheck = applyMoveToCell(direction, nextCell);
                    if (!state.grid.outOfBounds(cellToCheck) && state.grid.value(cellToCheck) <= WARNING) {
                        scores[move] += MULTIPLIER.TIGHT_MOVE;
                    }
                }
            }
        }
    } catch(e) {
        log.error(`EX in search.tightMoveBias: ${e}`);
    }
    return scores;
}


export const distanceFromCellToClosestFoodInFoodList = (start: Cell, state: State): number => {
    try {
        const foodList = state.board.food;
        let closestFoodCell = null;
        let closestFoodDistance = 9999;
        for (let food of foodList) {
            let currentDistance = getDistance(start, food);
            if (currentDistance < closestFoodDistance) {
                closestFoodCell = food;
                closestFoodDistance = currentDistance;
            }
        }
        return ((closestFoodDistance === 9999) ? (state.board.height * 0.7) : closestFoodDistance);
    }
    catch (e) {
        log.error(`ex in search.distanceFromCellToClosestFoodInFoodList: `, e);
    }
    return ((state?.board?.height) ? (state.board.height * 0.7) : 80);
}


export const validMove = (move: number, cell: Cell, state: State): boolean => {
    const newCell = applyMoveToCell(move, cell);
    if (state.grid.outOfBounds(newCell)) {
        return false;
    }
    return (state.grid.value(newCell) <= DANGER);
}


export const closestFood = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, FOOD);
}


export const closestKillableSnake = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, KILL_ZONE);
}


export const closestDangerSnake = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, ENEMY_HEAD);
}


export const closestTarget = (startCell: Cell, grid: Grid, targetType: number): Cell | null => {
    try {
        let closestTarget = null;
        let closestDistance = 9999;
        for (let i = 0; i < grid.height; i++) {
            for (let j = 0; j < grid.width; j++) {
                const target = newCell(j, i);
                if (grid.value(target) === targetType) {
                    const distance = getDistance(startCell, target);
                    if (distance < closestDistance) {
                        closestTarget = target;
                        closestDistance = distance;
                    }
                }
            }
        }
        return closestTarget;
    } catch (e) {
        log.error(`ex in target.closestTarget ${e}`);
    }
    return null;
}


export const floodFill = (startPosition: Cell, state: State, constraints: number[] = []): number => {
    const TRUE = 1;
    const FALSE = 0;
    const self = state.self;

    // initialize tracking structures
    let closedGrid = new Grid(state.grid.width, state.grid.height, FALSE);
    let openGrid = new Grid(state.grid.width, state.grid.height, FALSE);
    let openStack: Cell[] = [];

    // things to track
    let area = 0;
    let enemyHeads = 0;
    let killZones = 0;
    let tails = 0;
    let foods = 0;
    let warnings = 0;
    let walls = 0;
    let dangers = 0;
    let futures = 0;

    // const inGrid = (cell: Cell, grd: Grid): number => {
    //     try {
    //         return grd.value(cell);
    //     }
    //     catch (e) {
    //         log.error(`ex in search.fill.inGrid: ${e}`);
    //         return NOT_CHECKED;
    //     }
    // };

    const addToOpen = (cell: Cell): boolean => {
        try {
          if (!state.grid.outOfBounds(cell) && !closedGrid.value(cell) && !openGrid.value(cell)) {
                if (state.grid.value(cell) <= DANGER) {
                    for (let constraint of constraints) {
                        // if very first cell you test is a killzone or future move, thats fine, don't return
                        if (area === 0 && (state.grid.value(cell) === KILL_ZONE || state.grid.value(cell) === FUTURE_2)) {
                            break;
                        }
                        if (state.grid.value(cell) === constraint) {
                            return false;
                        }
                    }
                    openStack.push(cell);
                    openGrid.updateCell(cell, TRUE);

                } else {
                    switch(state.grid.value(cell)) {
                        case ENEMY_HEAD:
                        case SMALL_HEAD:
                            enemyHeads++;
                            break;
                        default:
                    }
                }
            }
        }
        catch (e) {
            log.error(`ex in search.floodFill.addToOpen: ${e}`);
        }
        return false;
    };

    const removeFromOpen = (): Cell | null => {
        try {
            let cell = openStack.pop();
            if (!cell) {
                return null;
            }
            openGrid.updateCell(cell, FALSE);
            return cell;
        }
        catch (e) {
            log.error(`ex in search.floodFill.removeFromOpen: ${e}`);
        }
        return null;
    };

    const addToClosed = (cell: Cell | null) => {
        if (cell === null) {
            return;
        }
        closedGrid.updateCell(cell, TRUE); 
    };

    let current = myLocation(state);
    // let givenMovePos = newCell(current.x, current.y);
    addToOpen(startPosition);
    addToClosed(current);

    // iterate over all possible moves given the current move
    while (openStack.length > 0) {
        const nextMove = removeFromOpen();
        if (nextMove !== null) {
            addToClosed(nextMove);
            switch(state.grid.value(nextMove)) {
                // case k.ENEMY_HEAD:
                // case k.SMALL_HEAD:
                //   enemyHeads++;
                //   break;
                case TAIL:
                    tails++;
                    break;
                case KILL_ZONE:
                    killZones++;
                    break;
                case FOOD:
                    foods++;
                    break;
                case WALL_NEAR:
                    walls++;
                    break;
                case WARNING:
                    warnings++;
                    break;
                case DANGER:
                case SMALL_DANGER:
                    dangers++;
                    break;
                case FUTURE_2:
                    futures++;
                    break;
                default:
            }
            area++;

            // check down
            const nDown = newCell(nextMove.x, nextMove.y - 1);
            addToOpen(nDown);
            // check up
            const nUp = newCell(nextMove.x, nextMove.y + 1);
            addToOpen(nUp);
            // check left
            const nLeft = newCell(nextMove.x - 1, nextMove.y);
            addToOpen(nLeft);
            // check right
            const nRight = newCell(nextMove.x + 1, nextMove.y);
            addToOpen(nRight);
        }
    }

    let score = 0;
    score += area * BASE_WEIGHT.SPACE;
    score += tails * BASE_WEIGHT.TAIL;
    score += foods * BASE_WEIGHT.FOOD;
    score += enemyHeads * BASE_WEIGHT.ENEMY_HEAD;
    score += killZones * BASE_WEIGHT.KILL_ZONE;
    score += warnings * BASE_WEIGHT.WARNING;
    score += walls * (BASE_WEIGHT.WALL_NEAR * MULTIPLIER.WALL_NEAR_FILL);
    score += dangers * (BASE_WEIGHT.DANGER * MULTIPLIER.DANGER_FILL);
    score += futures * BASE_WEIGHT.FUTURE_2;

    log.debug(`Score in fill for cell ${cellToString(startPosition)}: ${score.toFixed(1)}. Area: ${area}`);
    return score;
}