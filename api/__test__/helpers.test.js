const Helpers = require("../src/utils/helpers.js");

describe("test test: sum", () => {
    test("Returns sum of the numbers", async () => {
        expect(Helpers.sum(1, 2)).toBe(3);
    });
});

/**
 * Unit Test
 */

describe("helper function; special character tester", () => {

    test("no ';'" , async (done) =>{
        try {
            expect(Helpers.specialCharacter(";")).toBe(true);
            done();
        } catch (error) {
            console.log(error);
        }
    });

    test("no ' " , async (done) =>{
        try {
            expect(Helpers.specialCharacter("'")).toBe(true);
            done();
        } catch (error) {
            console.log(error);
        }
    });

        
});