# Battlesnake using TypeScript and Deno
A [Battlesnake](https://play.battlesnake.com/) written in TypeScript. Includes types for the Battlesnake API objects.

This snake is built using [Deno](https://deno.land/) as a runtime, and the Deno standard http server via [Oak](https://deno.land/x/oak) middleware.

![CI](https://github.com/tyrelh/battlesnake-typescript-node/workflows/CI/badge.svg?branch=master)

## TL;DR
* [Requirements](#Requirements):
    * [Deno](https://deno.land/manual/getting_started/installation)
    * Optionally [ngrok](https://ngrok.com/) and [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
* [Setup](#Setup):
    * Clone repo
    * Install [Deno](https://deno.land/manual/getting_started/installation)
* [Running the snake locally](#Running-the-snake-locally):
    * `deno run --allow-net app.ts`
    * Download and run [ngrok](https://ngrok.com/) to develop locally using the [Battlesnake Arena](https://play.battlesnake.com/arena/global/)
* [Deploy to Heroku](#Deploy-to-Heroku):
    * Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
    * Create new app using Deno [buildpack](https://github.com/chibat/heroku-buildpack-deno)
    * Push your code to that app using git
* [Development](#Development):
    * Checkout the [Battlesnake API docs](https://docs.battlesnake.com/references/api)
    * Start by editing the `move` function within *app/main.ts*
* [Testing](#Testing):
    * `deno test`
    * Add new tests in *tests/*

## Requirements
* [Deno](https://deno.land/manual/getting_started/installation)
* Optionally:
    * [ngrok](https://ngrok.com/)
    * [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) (can deploy elsewhere as well)

## Setup
First, clone this repo
```bash
git clone https://github.com/tyrelh/starter-snake-deno.git starter-snake-deno
cd starter-snake-deno
```

If you don't have Deno installed, install it. (Example using Brew in MacOS. Refer to the [Deno docs](https://deno.land/manual/getting_started/installation) for other OSs)
```bash
brew install deno
```

## Running the snake locally
To run the snake locally type
```bash
deno run --allow-net app.ts
```
Since Deno has no permissions by default the `--allow-net` gives your snake network access.

### Battlesnake Arena using ngrok

If you want to use the [Battlesnake Arena](https://play.battlesnake.com/arena/global/) for testing you will need a tool such as [ngrok](https://ngrok.com/) to allow the arena to communicate with your server on your local machine.

1. Sign up for a free account with [ngrok](https://dashboard.ngrok.com/signup)
2. Download their executable. This can be placed somewhere global on your machine or in your project directory.
3. Make sure your snake server is running.
4. Wherever you put that executable, run `ngrok http 5000`. Make sure the port supplied matches the port your snake is using (this project defaults to `5000`).
5. You should see a forwarding URL in the terminal running ngrok. Copy the http URL, it should look something like `http://147fb4e4.ngrok.io`.
6. Go to the [Battlesnake Arena](https://play.battlesnake.com/arena/global/) and login with your Github account. [Create a new snake](https://play.battlesnake.com/account/snakes/create/) and enter the ngrok URL.

Test it out by running a game!

Some things to note about using ngrok to run your snake locally:
* ngrok adds a lot of latency to your snake. With a decent internet connection I was seeing times of around 130-150ms, but I have seen that spike well over the default timeout of 500ms. Just something to be aware of. ngrok should only be used for development and avoided for any competitions.
* If you restart the ngrok process it will generate a new random URL for you. That means you need to edit the URL of your snake on the Battlesnake Arena to reflect this.

## Deploy to Heroku
Better than running your snake locally is running it on a server!

You can sign up for a free [Heroku](https://www.heroku.com/) account. Their free tier will allow you to run a single snake server 24/7 and you won't use all your allotted time each month. Running multiple servers you may hit that free limit.

If you don't have the Heroku CLI installed, install it. (Example using Brew on MacOS. Refer to the [Heroku docs](https://devcenter.heroku.com/articles/heroku-cli) for other OSs)
```bash
brew install heroku
```

Login to your Heroku account
```bash
heroku login -i
```

Since Heroku machines don't have Deno installed by default we need to use what is called a Buildpack to set up the Heroku server with Deno. Luckily one exists for us to use, created by [chibat](https://github.com/chibat/heroku-buildpack-deno).
```bash
heroku create your-unique-snake-name --buildpack https://github.com/chibat/heroku-buildpack-deno.git
```
Now you can push your snake code to this new server
```bash
git push heroku master
```

Note: This Buildpack is installing software on your Heroku server on your behalf. I encourage you to explore that [repo](https://github.com/chibat/heroku-buildpack-deno) and understand what it is doing if you have any concerns.

## Development
Visit the [Battlesnake API docs](https://docs.battlesnake.com/references/api) for the latest API info.

Start by adding some logic to the `move` function in *app/main.ts* to choose a different move! Just make sure you are returning one of `"up"`, `"down"`, `"left"`, or `"right"`.

The `gameRequest` object will contain all of the details about the current move, including the board size and state. Once you are comfortable with how the `move` function is returning a direction, look around in the `gameRequest` object for information you can use to make an informed direction decision.

## Testing
Deno comes with a built in test runner!

To run tests, in the root of your project run
```bash
deno test
```
By default this will search the whole project for files ending in test (`{*_,}test.{js,ts,jsx,tsx}`).

There are two test files created for you in the *tests/* directory.

In *move_test.ts* you can see the test is using a mock game JSON object of the same type you will be receiving for each call to `/move`. It is testing for the default response of `"right"`. This is set up in a way that you can copy/paste real JSON requests from real games into this file and test that your snake will return an expected response!

You can also add tests for any other functions you create along the way. To create a new test add another call to `Deno.test` like this
```typescript
Deno.test("My test", () => {
  const result = methodYouAreTesting();

  assert(result?.fieldYouExpect)
  assert(result.fieldYouExpect === valueYouExpect)
});
```

In *root_test.ts* the test simply verifying that the response contains the expected fields. It is not testing the content of those fields.

## Contributing
If you have any questions or suggestions feel free to open an Issue or PR on this repo.

You can find other ways to get in touch with me on my [site](https://tyrelh.github.io).