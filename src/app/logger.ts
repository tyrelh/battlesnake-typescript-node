import { CONSOLE_LOG, STATUS, DEBUG } from "./params";
import { GameRequest } from "./types";
import fs from "fs";
import AWS from "aws-sdk";

const BATTLESNAKE_AWS_POOL_ID = process.env.BATTLESNAKE_AWS_POOL_ID;

if (BATTLESNAKE_AWS_POOL_ID) {
    AWS.config.region = 'us-west-2';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: BATTLESNAKE_AWS_POOL_ID,
    });
}

export const divider = "`\n\n#######################################";
let consoleRed = '\x1b[31m%s\x1b[0m';

// globals for logging across whole game
// will cause errors when multiple games running simultaneously
let log = "";
let exLog = "############################# EXCEPTIONS\n";
let errorHappened = false;
let JSONData = "";


/**
 * Log an error message and optional exception
 * @param message 
 * @param exception 
 */
export const error = (message: string, exception?: Error) => {
    errorHappened = true;
    let msg = `!! ERROR: ${message}`;
    log += `${msg}\n`;
    exLog += `${message}\n`;
    if (CONSOLE_LOG) {
        if (exception) {
            console.error(consoleRed, `${msg}: ${exception}`);
        }
        else {
            console.error(consoleRed, msg);
        }
    }
}


/**
 * Log a status message
 * @param message 
 */
export const status = (message: string) => {
    if (STATUS) {
        log += `${message}\n`;
        if (CONSOLE_LOG) {
            console.log(message);
        }
    }
}


/**
 * Log a debug message
 * @param message 
 */
export const debug = (message: string) => {
    if (DEBUG) {
        log += `DEBUG: ${message}\n`;
        if (CONSOLE_LOG) {
            console.log(`DEBUG: ${message}`);
        }
    }
}


/**
 * Save the game request JSON
 * @param gameRequest
 */
export const saveJSON = (gameRequest: GameRequest) => {
    try {
        JSONData += `\n#############################  TURN  ${gameRequest.turn}\n`;
        JSONData += `${JSON.stringify(gameRequest)}\n`;
    }
    catch (e) {
        error(`ex in logger.saveJSON: ${e}`);
    }
}


export const initLogs = () => {
    log = "";
    exLog = "############################# EXCEPTIONS\n";
    errorHappened = false;
    JSONData = "";
}


export const writeLogs = (gameRequest: GameRequest) => {
    if (errorHappened && CONSOLE_LOG) {
        console.error(consoleRed, exLog);
    }
    const gameID = gameRequest.game.id;
    const path = `${__dirname}/../logs/`;
    const gameLogsFilename = `${gameID}.txt`;
    const gameJSONFilename = `${gameID}-JSON.txt`;
    // append game exeptions to end of log for easy viewing
    if (errorHappened) {
        log += "\n" + exLog;
    }

    pushLogsToS3(gameRequest);
    writeGameLogs(`${path}${gameLogsFilename}`, gameID);
    writeJSONRequests(`${path}${gameJSONFilename}`, gameID);
}


const pushLogsToS3 = (gameRequest: GameRequest) => {
    const gameID = gameRequest.game.id;
    const snakeName = gameRequest.you.name.trim().replace(/\s+/g, "").toLowerCase();
    const s3Directory = `logs/${snakeName}/`;
    const s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      params: { Bucket: "battlesnake-logs" }
    });

    const gameLogsKey = `${s3Directory}logs-${gameID}.txt`;
    const gameLogsParams = {
        Body: log,
        Key: gameLogsKey,
        Bucket: "battlesnake-logs"
    }
    s3.putObject(gameLogsParams, (err, s3PutData) => {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log(`Wrote game logs to S3 ${gameLogsKey}`);
      }
    })

    const gameRequestsKey = `${s3Directory}JSON-${gameID}.txt`;
    const requestJSONParams = {
        Body: JSONData,
        Key: gameRequestsKey,
        Bucket: "battlesnake-logs"
    }
    s3.putObject(requestJSONParams, (err, s3PutData) => {
        if (err) {
            console.error(err, err.stack);
        } else {
            console.log(`Wrote requests JSON logs to S3 ${gameRequestsKey}.`);
        }
    })
}


const writeGameLogs = async (path: string, gameID: string) => {
    try {
        // write log
        fs.writeFile(path, log, (err) => {
            if (err) {
                console.error(consoleRed, `There was an error saving the logs: ${err}`);
                return false;
            }
            console.log(`The log for game ${gameID} was saved.`);
            // update index of logs
            // read current index
            fs.readFile(
                `${__dirname}/../logs/index.html`,
                "utf8",
                (err, contents) => {
                    // append new entry
                    const newEntry = `<a href="/logs/${gameID}.txt">GAME: ${gameID}</a><br />`;
                    const newIndex = contents + "\n" + newEntry;
                    // write updated index
                    fs.writeFile(
                        `${__dirname}/../logs/index.html`,
                        newIndex,
                        err => {
                            if (err) {
                                console.error(consoleRed, `There was an error saving the new index.html: ${err}`);
                                return false;
                            }
                            console.log("The logs index.html was updated");
                            return true;
                        }
                    )
                }
            );
        });
    } catch (e) {
        console.error(consoleRed, `EX in logger.writeGameLogs: ${e}`);
    }
    return false;
}


const writeJSONRequests = (path: string, gameID: string): boolean => {
    try {
        // write JSON log
        fs.writeFile(path, JSONData, (err) => {
            if (err) {
                console.error(consoleRed, `There was an error saving the JSON logs: ${err}`);
                return false;
            }
            console.log(`The JSON log for game ${gameID} was saved.`);
            return true
        });
    } catch (e) {
        console.error(consoleRed, `EX in logger.writeJSONRequests: ${e}`);
    }
    return false;
}