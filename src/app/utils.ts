import { Cell } from "./types";
import { UP, DOWN, LEFT, RIGHT } from "./keys";
import { Y_DIRECTION } from "./params";
import * as log from "./logger";


/**
 * Create a new Cell
 * @param x 
 * @param y 
 */
export const newCell = (x: number, y: number): Cell => {
    return { x: x, y: y };
}


export const applyMoveToCell = (move: number, cell: Cell): Cell => {
    switch (move) {
        case UP:
            return newCell(cell.x, cell.y + (Y_DIRECTION === UP ? 1 : -1));
        case DOWN:
            return newCell(cell.x, cell.y + (Y_DIRECTION === UP ? -1 : 1));
        case LEFT:
            return newCell(cell.x - 1, cell.y);
        case RIGHT:
            return newCell(cell.x + 1, cell.y);
        default:
            return cell;
    }
}


/**
 * Combines two Cells coordinates to create a new Cell
 * @param offset 
 * @param cell 
 */
export const applyOffsetToCell = (offset: Cell, cell: Cell): Cell => {
    return { x: offset.x + cell.x, y: offset.y + cell.y };
}


/**
 * Manhattan distance between two Cells
 * @param a 
 * @param b 
 */
export const getDistance = (a: Cell, b: Cell): number => {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y));
};

/**
 * calculate direction from a to b
 * @param a 
 * @param b 
 */
// FIXME: could be inaccurate if a and b are far apart
// TODO: rethink how this works if there are two directions that are the same distance tyrelh
export const calcDirection = (a: Cell, b: Cell): number | null => {
    try {
      const xDelta = a.x - b.x;
      const yDelta = a.y - b.y;
      if (xDelta < 0) return RIGHT;
      else if (xDelta > 0) return LEFT;
      else if (yDelta < 0) return UP;
      else if (yDelta > 0) return DOWN;
    }
    catch (e) {
        log.error(`ex in utils.calcDirection: ${e}`);
    }
    return null;
};


/**
 * test if cells are the same
 * @param a 
 * @param b 
 */
export const sameCell = (a: Cell, b: Cell): boolean => {
    try {
      return (a.x === b.x && a.y === b.y);
    }
    catch (e) {
      log.error(`ex in utils.sameCell: ${e}`);
      return false;
    }
};


/**
 * check if array contains a given pair
 * @param arr 
 * @param cell 
 */
export const arrayIncludesCell = (arr: Cell[], cell: Cell): boolean => {
    for (let nextCell of arr) {
      if (sameCell(nextCell, cell)) {
        return true;
      }
    }
    return false;
};


/**
 * String representation of Cell
 * @param cell 
 */
export const cellToString = (cell: Cell) => {
    return `{ x: ${cell.x}, y: ${cell.y} }`;
}
