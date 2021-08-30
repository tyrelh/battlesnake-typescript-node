# Battlesnake AI using TypeScript and Node

![CI/CD](https://github.com/tyrelh/battlesnake-typescript-node/workflows/CI/CD/badge.svg)

A [Battlesnake AI written in TypeScript using [Node](https://nodejs.org/en/) as a runtime and [Express](https://expressjs.com/) as the server framework.

This project uses [ts-node](https://github.com/TypeStrong/ts-node) for running TypeScript, [Mocha](https://mochajs.org/) for testing, [nodemon](https://nodemon.io/) for development locally, and `tsc` for compiling TypeScript.

## Requirements
* [Node](https://nodejs.org/en/)

## Setup
First, clone this repo

```shell script
git clone https://github.com/tyrelh/battlesnake-typescript-node.git battlesnake-typescript-node
cd battlesnake-typescript-node
```

If you don't have Node installed then install it next.(Example using Brew in MacOS. Refer to the [Node docs](https://nodejs.org/en/download/package-manager/) for other OSs)

```shell script
brew install node
```

Now install all the project dependencies with `npm`.

```shell script
npm install
```

## Running the snake locally

To run the snake locally simply use `npm`:

```shell script
npm run dev
```

This script uses *nodemon* to run the server and watch local files for changes.

### Battlesnake Arena using ngrok

If you want to use the [Battlesnake Arena](https://play.battlesnake.com/arena/global/) for testing locally you will need a tool such as [ngrok](https://ngrok.com/) to allow the arena to communicate with your server on your local machine.

1. Sign up for a free account with [ngrok](https://dashboard.ngrok.com/signup)
2. Download their executable. This can be placed somewhere global on your machine or in your project directory.
3. Make sure your snake server is running locally.
4. Wherever you put that executable, run `ngrok http 5000`. Make sure the port supplied matches the port your snake is using (this project defaults to `5000`).
5. You should see a forwarding URL in the terminal running ngrok. Copy the http URL, it should look something like `http://147fb4e4.ngrok.io`.
6. Go to the [Battlesnake Arena](https://play.battlesnake.com/arena/global/) and login with your Github account. [Create a new snake](https://play.battlesnake.com/account/snakes/create/) and enter the ngrok URL.

Some things to note about using ngrok to run your snake locally:
* ngrok adds a lot of latency to your snake. With a decent internet connection I was seeing times of around 130-150ms, but I have seen that spike well over the default timeout of 500ms. Just something to be aware of. ngrok should only be used for development and avoided for any competitions.
* If you restart the ngrok process it will generate a new random URL for you. That means you need to edit the URL of your snake on the Battlesnake Arena to reflect this.

## Testing
Tests can be run with `npm`:

```shell script
npm run test
```

This script uses *mocha* and *ts-node* to run the TypeScript tests located in *src/tests/*.

## Automated Deploys
This repo is set up, using Github Actions, for automated deployments to AWS Elastic Beanstalk.

## Contributing
If you have any questions or suggestions feel free to open an Issue or PR on this repo.

You can find other ways to get in touch with me on my [tyrelh.github.io](https://tyrelh.github.io).
