import {assert} from "chai";
import "mocha";
import {root} from "../src/app/main";

describe("Root response contains expected fields", () => {
    it(`should values for return all required fields`, () => {
        const result = root();
        assert.isString(result?.apiversion);
        assert.isString(result?.author);
        assert.isString(result?.head);
        assert.isString(result?.tail);
        assert.isString(result?.color);
    });
});
