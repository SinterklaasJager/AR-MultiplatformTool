const express = require('express')
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const {
  doesNotMatch
} = require('assert');

const port = 3000


const pg = require('knex')({
  client: 'pg',
  version: '9.6',
  searchPath: ['knex', 'public'],
  connection: process.env.PG_CONNECTION_STRING ? process.env.PG_CONNECTION_STRING : 'postgres://example:example@localhost:5432/test'
});


const app = express();
http.Server(app);


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.get('/test', (req, res) => {

  res.status(200).send();
});

app.get('/', async (req, res) => {

  res.sendFile(__dirname + '/root.html');

});

///////////////////////////////
//    Handle Incoming Data   //
///////////////////////////////

app.post('/addGame', async (req, res) => {

    console.log("Added a Game");

    //  let checkContentLength = Helpers.checkContentLength(req.body.content, 100);
    //  let checkContentType = Helpers.checkIfString(req.body.content);

    //  if(!checkContentLength || !checkContentType) {
    //    res.status(404).send() 
    //  }else {
    const uuid = Helpers.generateUUID();

    const result = await pg
      .table("games")
      .insert({
        uuid: uuid,
        title: req.body.title,
        players: req.body.players,
        winner: req.body.winner,
        rounds: req.body.rounds,
      })
      .then(async function () {
        res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
      });

  }

  //  }
);



//Get Records

// table.uuid('uuid');
// table.string('title');
// table.string('players');
// table.string('winner');
// table.integer("rounds");


app.get('/getAllGames', async (req, res) => {

  console.log("get all games");

  const result = await pg.select("*").from("games");
  res.json({
    res: result,
  });

});

//Get record by id

app.get('/getGameById/:id', async (req, res) => {

  const result = await pg
    .select("*")
    .from("games")
    .where({
      id: req.params.id
    }).then(async (data) => {
      if (data.length >= 1) {
        res.json({
          res: data,
        });
      } else {
        res.status(404).send();
      }
    });
});

//Delete Game

app.delete('/deleteGame/', async (req, res) => {

  console.log("delete game");

  if (req.body.hasOwnProperty('uuid')) {
    const result = await pg.from("games").where({
      uuid: req.body.uuid
    }).del().then((data) => {
      res.json(data);
    }).catch(() => res.status(404).send());
  } else {
    res.status(404).send();
  }

});

app.get('/getPlayerByID/', async (req, res) => {

  console.log("get player by ID");


});

///////////////////////////////
//        Analyze Data       //
///////////////////////////////



///////////////////////////////
//       Create Tables       //
///////////////////////////////


async function initialiseTables() {
  await pg.schema.hasTable('players').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('players', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('content');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table players');
        });

    }
  });
  await pg.schema.hasTable('games').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('games', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('title');
          table.string('players');
          table.string('winner');
          table.integer("rounds");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table games');
          for (let i = 0; i < 10; i++) {
            const uuid = Helpers.generateUUID();
            await pg.table('games').insert({
              uuid,
              title: `random element number ${i}`
            })
          }
        });

    }
  });
}
initialiseTables();

module.exports = app;