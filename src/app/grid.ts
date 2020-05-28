import { GameRequest, Cell, Snake } from "./types";
import { WALL_NEAR, FOOD, YOUR_BODY, SMALL_HEAD, SNAKE_BODY, ENEMY_HEAD, TAIL, DANGER, KILL_ZONE, SMALL_DANGER, FUTURE_2, DOWN, GRID_SYMBOLS, SPACE, UP } from "./keys";
import { newCell, applyOffsetToCell, cellToString } from "./utils";
import * as log from "./logger";
import { Y_DIRECTION, DEBUG_MAPS } from "./params";
import { isFriendly, isMe, myLocation } from "./self";
import { getEnemySnakes, edgeFillFromEnemyToSelf } from "./search";
import { State } from "./state";


export class Grid {

    width: number;
    height: number;
    data: number[][];

    constructor(width: number, height: number, fillValue?: number) {
        this.width = width;
        this.height = height;
        this.data = this.initGrid(this.width, this.height, fillValue);
    }


    /**
     * Create a grid: number[][] filled with a given value
     * @param width width of grid
     * @param height height of grid
     * @param fillValue value to fill grid with
     */
    initGrid = (width: number, height: number, fillValue: number = SPACE): number[][] => {
        const grid = new Array(height);
        for (let i = 0; i < height; i++) {
            grid[i] = new Array(width);
            for (let j = 0; j < height; j++) {
                grid[i][j] = fillValue;
            }
        }
        return grid;
    }


    /**
     * Build grid using game state of current turn
     * @param gameRequest game state for this turn
     */
    buildGrid = (gameRequest: GameRequest): number[][] => {
        const board = gameRequest.board;
        const self = gameRequest.you;
        const numberOfSnakes = board.snakes.length;

        // mark edges
        for (let y = 0; y < this.height; y++) {
            this.updateCell(newCell(0, y), WALL_NEAR);
            this.updateCell(newCell(this.width - 1, y), WALL_NEAR);
        }
        for (let x = 0; x < this.width; x++) {
            this.updateCell(newCell(x, 0), WALL_NEAR);
            this.updateCell(newCell(x, this.height - 1), WALL_NEAR);
        }

        // fill food locations
        board.food.forEach((food: Cell) => {
            this.updateCell(food, FOOD);
        });

        // fill snake locations
        board.snakes.forEach((snake: Snake) => {
            const snakeIsMe = snake.id === self.id;
            const friendlySnake = (isFriendly(snake) && numberOfSnakes >= 2);
            const dangerSnake = (snake.length >= self.length);

            // fill snake body locations
            snake.body.forEach((bodySegment: Cell) => {
                this.updateCell(bodySegment, (snakeIsMe) ? YOUR_BODY : SNAKE_BODY);
            });

            // fill head locations
            if (!snakeIsMe) {
                this.updateCell(snake.head, (dangerSnake || friendlySnake) ? ENEMY_HEAD: SMALL_HEAD)
            }

            // check if tail can be marked as tail or snake body
            if (snake.health !== 100 && gameRequest.turn > 1) {
                const tail = snake.body[snake.length - 1];
                this.updateCell(tail, TAIL);
            }

            // fill future locations around snake head
            if (!snakeIsMe) {
                // future 1
                let future1Key = DANGER;
                if (self.length > snake.length && !friendlySnake) {
                    future1Key = KILL_ZONE;
                }
                else if (self.length === snake.length && !friendlySnake) {
                    future1Key = SMALL_DANGER;
                }
                const future1Offsets = [
                    newCell(0, -1), // down
                    newCell(0, 1), // up
                    newCell(-1, 0), // left
                    newCell(1, 0) // right
                ];
                for (let offset of future1Offsets) {
                    try {
                        const position = applyOffsetToCell(offset, snake.head)
                        if (!this.outOfBounds(position) && this.value(position) < DANGER) {
                            this.updateCell(position, future1Key);
                        }
                    } catch (e) {
                        log.error("Ex in buildGrid.snake.future1: ", e);
                    }
                    
                }

                // future 2
                const future2Offsets = [
                    newCell(-1, -1),
                    newCell(-2, 0),
                    newCell(-1, 1),
                    newCell(0, 2),
                    newCell(1, 1),
                    newCell(2, 0),
                    newCell(1, -1),
                    newCell(0, -2)
                ];
                // TODO: tyrelh bug: marking tail as future 2 when cell not actually accessible in 2 turns
                try {
                    for (let offset of future2Offsets) {
                        const position = applyOffsetToCell(offset, snake.head)
                        if (!this.outOfBounds(position) && this.value(position) <= WALL_NEAR && this.value(position) !== FOOD) {
                            this.updateCell(position, FUTURE_2);
                        }
                    }
                } catch (e) {
                    log.error("Ex in buildGrid.snake.future2: ", e);
                }
                
            }
        });
        // this.print()
        return this.data;
    }


    /**
     * Preprocess grid to find valuable cells
     * @param state 
     */
    preprocessGrid = (state: State): void => {
        log.status("Preprocessing grid.")
        if (this.nearPerimeter(myLocation(state))) {
            log.debug("I am near perimeter.");
            const enemySnakes: Snake[] = getEnemySnakes(state);
            let gridDataCopy = this.copyGridData();

            for (let enemy of enemySnakes) {
                if (this.onPerimeter(enemy.head)) {
                    log.debug(`Enemy at ${cellToString(enemy.head)} is on perimeter`);
                    gridDataCopy = edgeFillFromEnemyToSelf(enemy, gridDataCopy, state);
                }
            }
            this.data = gridDataCopy
        }
    }


    /**
     * Return a deep copy of a Grid
     */
    copyGrid = (): Grid => {
        const gridCopy = new Grid(this.width, this.height);
        gridCopy.data = this.copyGridData();
        return gridCopy;
    }


    /**
     * Return a deep copy of a Grid matrix
     */
    copyGridData = (): number[][] => {
        const gridDataCopy = this.initGrid(this.width, this.height);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const cell = newCell(j, i);
                gridDataCopy[i][j] = this.value(cell)
            }
        }
        return gridDataCopy;
    }


    /**
     * Update a cell in a grid with newValue
     * @param cell 
     * @param newValue 
     */
    updateCell = (cell: Cell, newValue: number): Cell => {
        this.data[cell.y][cell.x] = newValue;
        return cell;
    }


    /**
     * Return value of a grid cell
     * @param cell 
     */
    value = (cell: Cell): number => {
        return this.data[cell.y][cell.x];
    }


    /**
     * Test if Cell is outside a grid
     * @param cell 
     */
    outOfBounds = (cell: Cell): boolean => {
        return (cell.x < 0 || cell.y < 0 || cell.y >= this.height || cell.x >= this.width);
    }


    /**
     * Test if Cell is near perimeter of game, but not on perimeter (1 space between cell and outOfBounds)
     * @param cell 
     */
    nearPerimeter = (cell: Cell): boolean => {
        return (cell.x === 1 || cell.x === this.width - 2 || cell.y === 1 || cell.y === this.height - 2);
    }


    /**
     * Test if Cell is on perimeter of game (0 spaces between cell and outOfBounds)
     * @param cell 
     */
    onPerimeter = (cell: Cell): boolean => {
        return (cell.x === 0 || cell.x === this.width - 1 || cell.y === 0 || cell.y === this.height - 1);
    }


    /**
     * Return a list of all locations of the given type
     * @param type
     */
    getAll = (type: number): Cell[] => {
        const cells: Cell[] = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const currentCell = newCell(j, i);
                if (this.value(currentCell) === type) {
                    cells.push(currentCell);
                }
            }
        }
        return cells;
    }


    /**
     * Pretty print a grid to the console
     */
    print = () => {
        if (DEBUG_MAPS) {
            if (Y_DIRECTION === DOWN) {
                let xAxis = "  ";
                for (let x = 0; x < this.width; x++) {
                    xAxis += ` ${x % 10}`
                }
                log.status(`${xAxis}\n`);
                for (let i = 0; i < this.height; i++) {
                    let row = `${i % 10} `;
                    for (let j = 0; j < this.width; j++) {
                        row += ` ${GRID_SYMBOLS[this.value(newCell(j, i))]}`;
                    }
                    log.status(row);
                }
            }
            else if (Y_DIRECTION === UP) {
                log.status("\n")
                for (let i = this.height - 1; i >= 0; i--) {
                    let row = `${i % 10} `;
                    for (let j = 0; j < this.width; j++) {
                        row += ` ${GRID_SYMBOLS[this.value(newCell(j, i))]}`;
                    }
                    log.status(row);
                }
                let xAxis = "  ";
                for (let x = 0; x < this.width; x++) {
                    xAxis += ` ${x % 10}`
                }
                log.status(`\n${xAxis}\n`);
            }
        }  
    };
}