const express = require('express')
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const {
  doesNotMatch
} = require('assert');

const port = 3001


const pg = require('knex')({
  client: 'pg',
  version: '9.6',
  searchPath: ['knex', 'public'],
  connection: process.env.PG_CONNECTION_STRING ? process.env.PG_CONNECTION_STRING : 'postgres://example:example@localhost:5432/ARdb'
});


const app = express();
http.Server(app);


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
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

    const uuid = Helpers.generateUUID();

    const resultGames = await pg
      .table("games")
      .insert({
        uuid: uuid,
        title: req.body.title,
        players: req.body.players,
        winner: req.body.winner,
        rounds: req.body.rounds,
        duration: req.body.rounds
      })
      .then(async function () {
        res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
      });

    const resultPlayers = await pg
      .table("players")
      .where()
      .insert({
        uuid: uuid,
        title: req.body.title,
        players: req.body.players,
        winner: req.body.winner,
        rounds: req.body.rounds,
        duration: req.body.rounds
      })
      .then(async function () {
        res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
      });

    const resultWinner = await pg
      .table("players")
      .where({
        uuid: req.body.winner
      })
      .then(async function () {
        res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
      });
  }




);


app.get('/getAllGames', async (req, res) => {

  console.log("get all games");

  const result = await pg.select("*").from("games");
  res.json({
    res: result,
  });

});



app.get('/getGameById/:id', async (req, res) => {

  let canPass = true;
  let id = parseInt(req.params.id);

  console.log(id);

 

  if (!Number.isInteger(id)) {
    canPass = false
  }

  if (id < 0 || id > 100000000000) {
  
    canPass = false
  }

  

  if (canPass) {
  
    try {
      const result = await pg
        .select("*")
        .from("games")
        .where({
          id: id
        })
      if (result.length < 1) {
        res.status(404).send();
      } else {
        res.send(result)
      }
    } catch (error) {
      res.send(error);
    }

  } else {
    console.log("Can Pass = " + canPass);
    res.status(400).send();
  }
});


app.get('/getPlayerById/:id', async (req, res) => {

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


app.delete('/deleteGame/:uuid', async (req, res) => {

  console.log("delete game");


  const result = await pg.from("games").where({
    uuid: req.params.uuid
  }).del().then((data) => {
    res.json(data);
  }).catch(() => res.status(404).send());

});


///////////////////////////////
//        Analyze Data       //
///////////////////////////////

//Get player win rate above x%
app.get('/getPlayerByWinPercent/percent', async (req, res) => {

  const result = await pg
    .select("Won_Games", "Played_Games")
    .from("players")

  for (const percent of result) {
    console.log(percent.Won_Games.length / percent.Played_Games.length);
    const percentages = (percent.Won_Games.length / percent.Played_Games.length) * 100;

    if (percentages >= req.params.percent) {
      result.push
    }
  }



});

//get all games over time period

//get all games with duration below x min
app.get('/getGamesByDuration/:duration', async (req, res) => {

  if (req.params.duration === "" || req.params.duration === null || req.params.duration != Number.isInteger) {
    res.status(400);
  } else {
    const result = await pg
      .select("*")
      .from("games")
      .where({
        duration: req.params.duration
      }).then(async (data) => {
        if (data.length >= 1) {
          res.json({
            res: data,
          });
        } else {
          res.status(404).send();
        }
      });
  }

});



//Check Player (id) cheater


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
          table.string('Played_Games');
          table.string("Won_Games");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table players');
          for (let i = 0; i < 10; i++) {
            const uuid = Helpers.generateUUID();
            await pg.table('players').insert({
              uuid,
              Played_Games: ["Game1", "Game2"],
              Won_Games: ["Game1", "Game2"]
            })
          }
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
          table.integer("duration");
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