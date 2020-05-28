import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import {end, move, root, start} from "./app/main";
import {GameRequest, MoveResponse} from "./app/types";

const PORT = process.env.PORT || 5000;


const handleIndex = (request: Request, response: Response) => {
    // const battlesnakeInfo = {
    //     apiversion: '1',
    //     author: '',
    //     color: '#888888',
    //     head: 'default',
    //     tail: 'default'
    // }
    response.status(200).json(root());
};

const handlePing = (request: Request, response: Response) => {
    response.status(200).send("ok");
};

const handleStart = (request: Request, response: Response) => {
    const gameRequest: GameRequest = request.body;
    start(gameRequest);
    response.status(200).send("ok");
};

const handleMove = (request: Request, response: Response) => {
    const gameRequest: GameRequest = request.body;
    const moveResponse: MoveResponse = move(gameRequest);
    response.status(200).send(moveResponse);
};

const handleEnd = (request: Request, response: Response) => {
    const gameRequest: GameRequest = request.body;
    end(gameRequest);
    response.status(200).send("ok")
};


const app: Application = express();
app.use(bodyParser.json());

app.get("/", handleIndex);
app.post("/ping", handlePing);
app.post("/start", handleStart);
app.post("/move", handleMove);
app.post("/end", handleEnd);

app.listen(PORT, () => console.log(`Battlesnake running on port ${PORT}`));