import { GameRequest, Game, Board, Snake } from "./types"
import { Grid } from "./grid"


export class State {

    request: GameRequest;
    game: Game;
    board: Board;
    self: Snake;
    grid: Grid;
    turn: number;

    constructor(gameRequest: GameRequest) {
        this.request = gameRequest;
        this.game = gameRequest.game;
        this.board = gameRequest.board;
        this.self = gameRequest.you;
        this.turn = gameRequest.turn;
        this.grid = new Grid(gameRequest.board.width, gameRequest.board.width);
        this.grid.buildGrid(gameRequest);
    }
}