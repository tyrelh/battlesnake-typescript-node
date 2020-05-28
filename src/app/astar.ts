import { Cell } from "./types";
import { State } from "./state";
import { SNAKE_BODY } from "./keys";
import * as log from "./logger";
import { sameCell, cellToString, newCell, arrayIncludesCell, getDistance } from "./utils";


export interface AstarSearchResult {
    success: boolean,
    distance: number,
    position: Cell
}


/**
 * Perform an astar search from the given start to the given destination. Will return next move and distance away
 * @param startCell 
 * @param destinationCell 
 * @param state 
 * @param avoidThreshold 
 * @param returnStartCell 
 */
export const astar = (startCell: Cell, destinationCell: Cell, state: State, avoidThreshold: number = SNAKE_BODY, returnStartCell: boolean = false): AstarSearchResult => {
    if (startCell === null || destinationCell === null) {
        log.status("Start or destination is null in astar. Must call with valid start and destination cells.");
        return newResult(false);
    }

    if (state.grid.outOfBounds(startCell) || state.grid.outOfBounds(destinationCell)) {
        log.status("Start or destination is outOfBounds in astar. Must call with valid start and destination cells.");
        return newResult(false);
    }

    if (sameCell(startCell, destinationCell) && returnStartCell) {
        log.status(`Start and destination are the same cell in astar. Returning start cell ${cellToString(startCell)} with distance 0.`);
        return newResult(true, 0, startCell);
    }

    log.status(`Calculating path (astar) from ${cellToString(startCell)} to ${cellToString(destinationCell)}.`);

    // initialize search fields
    const searchScores = buildAstarScoreGrid(state);
    let openSet: Cell[] = [];
    const closedSet: Cell[] = [];

    // add starting cell to open set
    openSet.push(startCell);

    // begin looping through open set
    while (openSet.length > 0) {
        let lowestCell = newCell(9999, 9999);
        let lowestF = 9999;

        // find cell with lowest f score
        for (let cell of openSet) {
            if (searchScores[cell.y][cell.x].f < lowestF) {
                // TODO: 2018 note: consider changing to <= and then also comparing g scores tyrelh
                lowestF = searchScores[cell.y][cell.x].f;
                lowestCell = newCell(cell.x, cell.y);
            }
        }

        // check if found destination
        if (sameCell(lowestCell, destinationCell)) {
            log.status("Found a path (lowestCell)");
            return walkback(searchScores, startCell, lowestCell, returnStartCell)
        }

        // if not found destination, keep searching
        let current = lowestCell;
        let currentCell = searchScores[current.y][current.x];

        // update sets
        openSet = openSet.filter((pair: Cell): boolean => !sameCell(pair, current));
        closedSet.push(current);

        // check every viable neighbor to current cell
        const currentNeighbors = searchScores[current.y][current.x].neighbors;
        for (let n = 0; n < currentNeighbors.length; n++) {
            const neighbor: Cell = currentNeighbors[n];
            let neighborCell: AstarScoreCell = searchScores[neighbor.y][neighbor.x];

            // check if path found
            if (sameCell(neighbor, destinationCell)) {
                log.status("Found a path (neighbor)");
                neighborCell.previous = current;
                return walkback(searchScores, startCell, neighbor, returnStartCell);
            }

            // else keep searching
            // check if neighbor can be moved to
            if (neighborCell.value < avoidThreshold) {
                // check if neighbor has already been evaluated
                if (!arrayIncludesCell(closedSet, neighbor)) {
                    const tempG = currentCell.g + 1;
                    let shorter = true;

                    // check if already evaluated with lower g score
                    if (arrayIncludesCell(openSet, neighbor)) {
                        if (tempG > neighborCell.g) {
                            // TODO: 2018 note: change to >=? tyrelh
                            shorter = false
                        }
                    }
                    // if not in either set, add to open set
                    else {
                        openSet.push(neighbor);
                    }

                    // this is the current best path, record it
                    if (shorter) {
                        neighborCell.g = tempG;
                        neighborCell.h = getDistance(neighbor, destinationCell);
                        neighborCell.f = neighborCell.g + neighborCell.h;
                        neighborCell.previous = current;
                    }
                }
            }
        }
    }
    // if reached this point and open set is empty, no path
    log.status("ASTAR: COULD NOT FIND PATH!");
    return newResult(false);
}


/**
 * Type result of astar search
 * @param success 
 * @param distance 
 * @param position 
 */
const newResult = (success: boolean, distance: number = 9999, position: Cell = newCell(1, 1)): AstarSearchResult => {
    return {
        success: success,
        distance: distance,
        position: position
    };
}


/**
 * trace path back to origin to find optimal next move
 * @param astarScoreGrid 
 * @param start 
 * @param destination 
 * @param returnStart 
 */
// TODO: walkback assumes there is a path to walk. No error handling if there isn't tyrelh
const walkback = (astarScoreGrid: AstarScoreCell[][], start: Cell, destination: Cell, returnStart: boolean = false): AstarSearchResult => {
    let nextPos = destination;
    let distance = 1;
    log.debug(`Astar start pos: ${cellToString(start)}`);
  
    if (sameCell(start, destination)) {
      log.debug(`Astar start same as destination: ${cellToString(destination)}`);
      return newResult(true, 0, start);
    }
  
    while (!sameCell(astarScoreGrid[nextPos.y][nextPos.x].previous, start)) {
      nextPos = astarScoreGrid[nextPos.y][nextPos.x].previous;
      distance += 1;
    }

    log.debug(`Astar next move: ${cellToString(nextPos)}`);
    let pos = returnStart ? astarScoreGrid[nextPos.y][nextPos.x].previous : nextPos;
    return newResult(true, distance, pos);
};


// construct a parallel search grid to store a* scores
const buildAstarScoreGrid = (state: State): AstarScoreCell[][] => {
    let astarScoreGrid = new Array(state.grid.height);
    for (let i = 0; i < state.grid.height; i++) {
        astarScoreGrid[i] = new Array(state.grid.width);
        for (let j = 0; j < state.grid.width; j++) {
            astarScoreGrid[i][j] = new AstarScoreCell(newCell(j, i), state);
        }
    }
    return astarScoreGrid;
  };


// cell of search grid to store a* scores
class AstarScoreCell {
    f: number;
    g: number;
    h: number;
    x: number;
    y: number;
    cell: Cell;
    value: number;
    neighbors: Cell[];
    previous: Cell

    constructor(cell: Cell, state: State) {
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.x = cell.x;
      this.y = cell.y;
      this.cell = cell;
      this.value = state.grid.value(cell);
      this.neighbors = [];
      this.previous = { x: 9998, y: 9998 };
      if (this.x < state.grid.width - 1) {
        this.neighbors.push(newCell(this.x + 1, this.y));
      }
      if (this.x > 0) {
        this.neighbors.push(newCell(this.x - 1, this.y));
      }
      if (this.y < state.grid.height - 1) {
        this.neighbors.push(newCell(this.x, this.y + 1));
      }
      if (this.y > 0) {
        this.neighbors.push(newCell(this.x, this.y - 1));
      }
    }
  };