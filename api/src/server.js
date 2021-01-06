const express = require('express')
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const {
  doesNotMatch
} = require('assert');
const {
  count
} = require('console');

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

  const AddGame = await pg
    .table("games")
    .insert({
      uuid: uuid,
      title: req.body.title,
      rounds: req.body.rounds,
      duration: req.body.duration
    })
    .catch((error) => {
      console.log(error);
    });

  for (const player of req.body.players) {
    console.log(player);
    AddPlayedGame(uuid,player);
  }

  const AddWinner = await pg
      .table("played_games")
      .where({
        Player_ID: req.body.winner
      })
      .update({
        Winner: true
      })
      .then(()=>{
        console.log(`winner ${req.body.winner} has been updated`)
        res.status(201).send("Game was saved");
      })
      .catch((error) => {
        console.log(error);
      });
  




});

async function AddPlayedGame(uuid, player) {
  console.log(uuid,player);
  const AddPlayedGame = await pg
    .table("played_games")
    .where()
    .insert({
      Game_ID:uuid,
      Player_ID: player,
      Winner: false
    }).catch((error) => {
      console.log(error);
    });
}


app.post('/addPlayer', async (req, res) => {

  const uuid = Helpers.generateUUID();

  const resultGames = await pg
    .table("players")
    .insert({
      uuid: uuid
    })
    .then(async function () {
      res.status(200).send();
    })
    .catch((error) => {
      console.log(error);
    });


});


app.get('/getAllGames', async (req, res) => {

  console.log("get all games");

  const result = await pg.select("*").from("games");
  console.log(result.length);
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

app.get('/getAllPlayers', async (req, res) => {

  const result = await pg.select("*").from("players");
  res.json({
    res: result,
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

app.get('/getWinPercentByPlayer/:id', async (req, res) => {


  let totalGames;
  let WonGames;
  let result;

  const totalGamesResult = await pg
    .select("Player_ID")
    .from('played_games')
    .where({
      Player_ID: req.params.id
    }).then(
      totalGames = totalGamesResult.length
    )
    .catch(() => res.status(400).send());

  const totalWonGamesResult = await pg
    .select("Player_ID")
    .from('played_games')
    .where({
      Player_ID: req.params.id,
      winner: true
    }).then(
      WonGames = totalWonGamesResult.length
    )
    .catch(() => res.status(400).send());

  result = WonGames / totalGames;

  res.send(result);

});

// Get player win rate above x%
app.get('/getPlayerByWinPercent/percent', async (req, res) => {

  const players = await pg
    .select("id")
    .from("players")
    .then()
    .catch(() => res.status(400).send());



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
      }).catch(() => res.status(400).send());
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
          table.integer('Amount_Of_Games_Played');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table players');
          for (let i = 0; i < 10; i++) {
            const uuid = Helpers.generateUUID();
            await pg.table('players').insert({
              uuid
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
          table.integer("rounds");
          table.integer("duration");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table games');
          // for (let i = 0; i < 10; i++) {
          //   const uuid = Helpers.generateUUID();
          //   await pg.table('games').insert({
          //     uuid,
          //     title: `random element number ${i}`
          //   })
          // }
        });

    }
  });

  await pg.schema.hasTable('played_games').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('played_games', (table) => {
          table.increments();
          table.string('Game_ID');
          table.string('Player_ID');
          table.boolean("Winner");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table played_games');

        });

    }
  });
}
initialiseTables();

module.exports = app;