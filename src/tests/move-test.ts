import {expect} from "chai";
import "mocha";
import {move} from "../app/main";

describe("Should take danger head on collision instead of dead end", () => {
    const gameRequest = {"game":{"id":"b06f98a8-f15a-4aa3-9b86-f3359caafed7","timeout":500},"turn":213,"board":{"height":11,"width":11,"food":[{"x":2,"y":4}],"snakes":[{"id":"gs_ywrf7YFHr6RCK7pDrCctG969","name":"Zero Cool Deno Snake Local","health":68,"body":[{"x":3,"y":6},{"x":2,"y":6},{"x":2,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":7},{"x":0,"y":8},{"x":1,"y":8},{"x":1,"y":9},{"x":2,"y":9},{"x":2,"y":8}],"head":{"x":3,"y":6},"length":12,"shout":""},{"id":"gs_XykScvhX9c6Q3BD6gkCpKvb9","name":"Wyrmhol","health":76,"body":[{"x":6,"y":5},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":2,"y":5},{"x":1,"y":5},{"x":0,"y":5},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":2},{"x":0,"y":1},{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0}],"head":{"x":6,"y":5},"length":16,"shout":""},{"id":"gs_MfGhMtJxB6Gg9gS6BjmtY8WX","name":"OG Jimmy","health":94,"body":[{"x":8,"y":1},{"x":7,"y":1},{"x":6,"y":1},{"x":5,"y":1},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":5,"y":3}],"head":{"x":8,"y":1},"length":8,"shout":""},{"id":"gs_cKYP9wgXXCh73Rp7DW8w4x98","name":"snacky","health":88,"body":[{"x":4,"y":7},{"x":5,"y":7},{"x":5,"y":6},{"x":6,"y":6},{"x":7,"y":6},{"x":7,"y":7},{"x":7,"y":8},{"x":6,"y":8},{"x":6,"y":9},{"x":5,"y":9},{"x":5,"y":10},{"x":4,"y":10}],"head":{"x":4,"y":7},"length":12,"shout":""}]},"you":{"id":"gs_ywrf7YFHr6RCK7pDrCctG969","name":"Zero Cool Deno Snake Local","health":68,"body":[{"x":3,"y":6},{"x":2,"y":6},{"x":2,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":7},{"x":0,"y":8},{"x":1,"y":8},{"x":1,"y":9},{"x":2,"y":9},{"x":2,"y":8}],"head":{"x":3,"y":6},"length":12,"shout":""}};
    const expectedMove = "up";

    it(`should return ${expectedMove}`, () => {
        const result = move(gameRequest);
        expect(result.move).to.equal(expectedMove);
    });
});

describe("Two dangerous snakes converging on the left move", () => {
    const gameRequest = {"game":{"id":"94feded6-26c7-4a9a-b9a3-570831fced0d","timeout":500},"turn":36,"board":{"height":11,"width":11,"food":[{"x":1,"y":1},{"x":2,"y":2}],"snakes":[{"id":"gs_9mgCVvHRD7QkPc6TCBcYMFbC","name":"SnickerSnek","health":78,"body":[{"x":0,"y":2},{"x":0,"y":3},{"x":1,"y":3},{"x":1,"y":2}],"head":{"x":0,"y":2},"length":4,"shout":""},{"id":"gs_rjMFrTGVqJhQ6Bg7q6C7qJvb","name":"hissin-bastid","health":97,"body":[{"x":8,"y":8},{"x":7,"y":8},{"x":6,"y":8},{"x":5,"y":8},{"x":5,"y":7},{"x":4,"y":7},{"x":3,"y":7},{"x":2,"y":7}],"head":{"x":8,"y":8},"length":8,"shout":""},{"id":"gs_FGrrMq96fmR3KQRjFFrVQp3D","name":"snacky","health":90,"body":[{"x":7,"y":5},{"x":6,"y":5},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":2,"y":5},{"x":1,"y":5},{"x":0,"y":5}],"head":{"x":7,"y":5},"length":8,"shout":""},{"id":"gs_gvx4VB8KdchgmRtWHf9xvfMS","name":"giraffe-snek","health":64,"body":[{"x":8,"y":6},{"x":7,"y":6},{"x":6,"y":6}],"head":{"x":8,"y":6},"length":3,"shout":""},{"id":"gs_CmkCbPbHKMg3Hq7Yv889vch8","name":"Zero Cool Deno Snake Local","health":64,"body":[{"x":9,"y":7},{"x":9,"y":6},{"x":9,"y":5}],"head":{"x":9,"y":7},"length":3,"shout":""}]},"you":{"id":"gs_CmkCbPbHKMg3Hq7Yv889vch8","name":"Zero Cool Deno Snake Local","health":64,"body":[{"x":9,"y":7},{"x":9,"y":6},{"x":9,"y":5}],"head":{"x":9,"y":7},"length":3,"shout":""}};
    const expectedMove = "right"; // up may be acceptable too, but definitely worse than right

    it(`should return ${expectedMove}`, () => {
        const result = move(gameRequest);
        expect(result.move).to.equal(expectedMove);
    });
})





// tricky one, two snakes to the right in a small area
const badMove = {"game":{"id":"331040cf-5c68-4ac5-a8a9-4e32f5ab54ef","timeout":500},"turn":67,"board":{"height":11,"width":11,"food":[{"x":7,"y":1},{"x":9,"y":9},{"x":9,"y":0}],"snakes":[{"id":"gs_qMmQ7pmrCbXwfFbp3HHpGgD9","name":"Hungry Snake","health":88,"body":[{"x":7,"y":2},{"x":7,"y":3},{"x":7,"y":4},{"x":7,"y":5},{"x":6,"y":5},{"x":6,"y":6},{"x":6,"y":7},{"x":5,"y":7},{"x":4,"y":7},{"x":4,"y":8}],"head":{"x":7,"y":2},"length":10,"shout":""},{"id":"gs_gYYGMrJxkTdkbdGHb9rFbPVH","name":"snake-2020","health":93,"body":[{"x":9,"y":2},{"x":9,"y":3},{"x":9,"y":4},{"x":9,"y":5},{"x":9,"y":6},{"x":8,"y":6},{"x":8,"y":7}],"head":{"x":9,"y":2},"length":7,"shout":""},{"id":"gs_MTcY9cdPFTcbtvF4DTGJHyjB","name":"Zero Cool Deno Snake Local","health":96,"body":[{"x":6,"y":1},{"x":6,"y":0},{"x":5,"y":0},{"x":4,"y":0},{"x":4,"y":1},{"x":5,"y":1},{"x":5,"y":2},{"x":4,"y":2}],"head":{"x":6,"y":1},"length":8,"shout":""}]},"you":{"id":"gs_MTcY9cdPFTcbtvF4DTGJHyjB","name":"Zero Cool Deno Snake Local","health":96,"body":[{"x":6,"y":1},{"x":6,"y":0},{"x":5,"y":0},{"x":4,"y":0},{"x":4,"y":1},{"x":5,"y":1},{"x":5,"y":2},{"x":4,"y":2}],"head":{"x":6,"y":1},"length":8,"shout":""}};