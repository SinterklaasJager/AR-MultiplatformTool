const supertest = require("supertest");
const app = require("../server.js");
const request = supertest(app);

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
