const Helpers = require("../src/utils/helpers.js");

describe("sum" ,() =>{
    test("Returns sum of the numbers",async()=>{
        expect(Helpers.sum(1,2)).toBe(3);
    });
});