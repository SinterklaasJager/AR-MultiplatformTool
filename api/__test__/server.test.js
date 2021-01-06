const supertest = require("supertest");
const app = require("../src/server.js");
const request = supertest(app);

describe("Add a Game",()=>{

});

describe("get a game by ID", ()=>{
    
    test("between 0-1billion" , async (done) =>{
        try {
            const response = await request.get('/getGameById/-500');
            console.log("response:" + response);
            expect(response.status).toBe(400);
            done();
        } catch (error) {
            console.log(error);
        }
    });

    test("is an integer" , async (done) =>{
        try {
            const response = await request.get('/getGameById/:somethinginthewayshemovesme/')
            expect(response.status).toBe(400)
            done();
        } catch (error) {
            console.log(error)
        }
    });
});

describe("Get Players by minimum win percentage",() =>{
    //percent must between 0 and 100
    //percent is a number
    //input can't be empty
    //if return is empty give error message
    
});

describe("Get Games made during x time period",()=>{
    //time period must be correct format
    //input can't be empty 
    //if return is empty give error message
    //if return is empty give error message
});

describe("get games that ended after x seconds",()=>{
    //input can't be empty
    //input must be an integer
    //absolute integer value can not be larger than max integer value
    //if return is empty give error message

});
