import {assert} from "chai";
import "mocha";
import {Grid} from "../src/app/grid";
import {FOOD} from "../src/app/keys";
import {newCell} from "../src/app/utils";
import {GameRequest} from "../src/app/types";


describe("Grid initGrid and buildGrid", () => {
    it(`Grid data should have valid dimensions and fill data`, () => {
        // given
        const grid = new Grid(mockGameRequest.board.width, mockGameRequest.board.height);
        // when
        grid.buildGrid(mockGameRequest);
        //then
        assert(grid.height === mockGameRequest.board.height);
        assert(grid.data.length === mockGameRequest.board.height);
        assert(grid.width === mockGameRequest.board.width)
        assert(grid.data[0].length === mockGameRequest.board.width)
        for (let food of mockGameRequest.board.food) {
            assert(grid.value(food) === FOOD);
        }
    });
});


describe("Grid updateCell", () => {
    it("Data should reflect updated value", () => {
        // given
        const grid = new Grid(mockGameRequest.board.width, mockGameRequest.board.height);
        grid.buildGrid(mockGameRequest);
        const testValue = 55;
        const testCell = newCell(5, 5);
        // when
        grid.updateCell(testCell, testValue);
        // then
        assert(grid.value(testCell) === testValue);
        assert(grid.data[testCell.y][testCell.x] === testValue);
        assert(grid.value(newCell(5, 4)) !== testValue);
    });
});


describe("Grid outOfBounds", () => {
    it("OutOfBounds returns correctly for true and false", () => {
        // given
        const grid = new Grid(mockGameRequest.board.width, mockGameRequest.board.height);
        grid.buildGrid(mockGameRequest);
        const cell1 = newCell(-1, 1);
        const cell2 = newCell(1, -1);
        const cell3 = newCell(-1, -1);
        const cell4 = newCell(mockGameRequest.board.width, 1);
        const cell5 = newCell(1, mockGameRequest.board.height);
        const cell6 = newCell(mockGameRequest.board.width, mockGameRequest.board.height);
        const cell7 = newCell(1, 1);
        const cell8 = newCell(mockGameRequest.board.width - 1, mockGameRequest.board.height - 1);
        // when
        const outOfBounds1 = grid.outOfBounds(cell1);
        const outOfBounds2 = grid.outOfBounds(cell2);
        const outOfBounds3 = grid.outOfBounds(cell3);
        const outOfBounds4 = grid.outOfBounds(cell4);
        const outOfBounds5 = grid.outOfBounds(cell5);
        const outOfBounds6 = grid.outOfBounds(cell6);
        const outOfBounds7 = grid.outOfBounds(cell7);
        const outOfBounds8 = grid.outOfBounds(cell8);
        // then
        assert(outOfBounds1);
        assert(outOfBounds2);
        assert(outOfBounds3);
        assert(outOfBounds4);
        assert(outOfBounds5);
        assert(outOfBounds6);
        assert(!outOfBounds7);
        assert(!outOfBounds8);
    });
});


const mockGameRequest: GameRequest = {
    game: {
        id: "gameid",
        timeout: 500
    },
    turn: 3,
    board: {
        height: 11,
        width: 11,
        food: [
            { x: 3, y: 3 }
        ],
        snakes: [
            {
                id: "someid",
                name: "Deno Snake",
                health: 97,
                body: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 }
                ],
                head: { x: 1, y: 1 },
                length: 3,
                shout: "Why are we shouting?"
            }
        ]
    },
    you: {
        id: "someid",
        name: "Deno Snake",
        health: 97,
        body: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 }
        ],
        head: { x: 1, y: 1 },
        length: 3,
        shout: "Why are we shouting?"
    }
}