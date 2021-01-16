const supertest = require("supertest");
const app = require("../src/server.js");
const request = supertest(app);


/**
 * Testflow
 * ----------------------------------------------
 * Two players are added
 * A game has been played and is added to the Db
 * Developer checks for any irregularities
 * Developer recieves data
 * Developer bans player and deletes player info
 */

let player1;
let player2;

describe("add players", () => {
    test("add a player", async (done) => {
        try {
            const response = await request.post('/addPlayer/');
            expect(response.status).toBe(200);
            console.log("RESPONSE.BODY.uuid: " + response.body.uuid);
            player1 = response.body.uuid;

            done();
        } catch (error) {
            console.log(error);
        }
    });

    test("add a second player", async (done) => {
        try {
            const response = await request.post('/addPlayer/');
            expect(response.status).toBe(200);
            player2 = response.body.uuid;
            done();
        } catch (error) {
            console.log(error);
        }
    });
});

describe("let's play a game", () => {

    let gameData;
    let gameUuid;

    //A game has been played and is added to the Db

    test("add a game", async (done) => {
        try {
            gameData = {
                title: "Civilization XI Game 1234567890",
                rounds: 12,
                duration: 123,
                players: [player1, player2],
                winner: player1
            }

            const response = await request.post("/AddGame").send(gameData);
            expect(response.status).toBe(201);
            gameUuid = (response.body.uuid);
            done();
        } catch (error) {
            console.log(error)
        }
    })
    //check if game really is added
    test("check if game is on database", async (done) => {
        try {
            const response = await request.get(`/getGameByUUID/${gameUuid}`);
            expect(response.status).toBe(200);
            done();
        } catch (error) {
            console.log(error);
        }
    })

    //Developer checks for any irregularities

    test("check winrate player 1", async (done) => {
        try {
            const response = await request.get(`/getWinPercentByPlayer/${player1}`);
            expect(response.body.winrate).toBe(1);
            done();
        } catch (error) {
            console.log(error);
        }
    })


    //Developer deletes deletes player info

    test("delete player", async (done) => {

        try {
            const response = await request.delete(`/deletePlayer/${player1}`)
            expect(response.status).toBe(200);
            done()
        } catch (error) {
            console.log(error);
        }
    });

    //check if player really is deleted

    test('look for players between players', async (done) => {

        try {
            const response = await request.get(`/getPlayerById/${player1}`)
            expect(response.status).toBe(404);
            done();
        } catch (error) {
            console.log(error);
        }
    })

})