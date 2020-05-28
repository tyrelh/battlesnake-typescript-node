import { CONSOLE_LOG, STATUS, DEBUG } from "./params";
// import { State } from "./state";
import { GameRequest } from "./types";
// import { readFileStr } from 'https://raw.githubusercontent.com/denoland/deno/v1.0.0-rc2/std/fs/read_file_str.ts'
// import { writeFileStr } from 'https://raw.githubusercontent.com/denoland/deno/v1.0.0-rc2/std/fs/write_file_str.ts'
import fs from "fs";


export const divider = "`\n\n#######################################";
// const __dirname = new URL('.', import.meta.url).pathname;
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
    writeGameLogs(`${path}${gameLogsFilename}`, gameID);
    writeJSONRequests(`${path}${gameJSONFilename}`, gameID);
}


const writeGameLogs = async (path: string, gameID: string) => {
    try {
        // await writeFileStr(path, log);
        // console.log(`The logs for game ${gameID} were saved.`);
        // const indexFile = await readFileStr(`${__dirname}/../logs/index.html`);
        // const decoder = new TextDecoder("utf-8");
        // // const indexText = decoder.decode(indexFile);
        // const newEntry = `<a href="/logs/${gameID}.txt">GAME: ${gameID}</a><br />`;
        // const newIndexText = indexFile + "\n" + newEntry;
        // writeFileStr(`${__dirname}/../logs/index.html`, newIndexText);
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
        // console.log(`The JSON requests for game ${gameID} are being saved.`);
        // writeFileStr(path, JSONData);
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