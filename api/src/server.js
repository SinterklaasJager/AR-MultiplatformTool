const express = require('express')
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const cors = require("cors");
const {
  doesNotMatch
} = require('assert');
const {
  count
} = require('console');
const {
  isString
} = require('util');

const port = 3001


const pg = require('knex')({
  client: 'pg',
  version: '9.6',
  searchPath: ['knex', 'public'],
  connection: process.env.PG_CONNECTION_STRING ? process.env.PG_CONNECTION_STRING : 'postgres://example:example@localhost:5432/ARdb'
});


const app = express();
http.Server(app);
app.use(cors());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


app.get('/test', (req, res) => {

  res.status(200).send();
});

/**
 * returns html file with possible connections
 * @param: none
 * @returns: root.html
 */

app.get('/', async (req, res) => {

  res.sendFile(__dirname + '/root.html');

});

///////////////////////////////
//    Handle Incoming Data   //
///////////////////////////////

/**
 * Adds a game
 * @param: body with uuid, title, players, the winner, rounds and duration
 * @returns: uuid of game
 */

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
    AddPlayedGame(uuid, player);
  }

  const AddWinner = await pg
    .table("played_games")
    .where({
      player_id: req.body.winner
    })
    .update({
      winner: true
    })
    .then(() => {
      console.log(`winner ${req.body.winner} has been updated`)
      res.status(201).send({
        uuid: uuid
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

async function AddPlayedGame(uuid, player) {

  const AddPlayedGame = await pg
    .table("played_games")
    .where()
    .insert({
      game_id: uuid,
      player_id: player,
      winner: false
    }).catch((error) => {
      console.log(error);
    });
}

/**
 * add a player
 * @param: none
 * @returns: player uuid
 */

app.post('/addPlayer', async (req, res) => {

  const uuid = Helpers.generateUUID();

  const resultGames = await pg
    .table("players")
    .insert({
      uuid: uuid
    })
    .then(async function () {
      res.status(200).send({
        uuid: uuid
      });
    })
    .catch((error) => {
      console.log(error);
    });
});


/**
 * get all games
 * @param: none
 * @returns: json with all games
 */

app.get('/getAllGames', async (req, res) => {

  console.log("get all games");

  const result = await pg.select("*").from("games");
  res.json({
    res: result,
  });

});


/**
 * get a specific game by id
 * @param: id
 * @returns: game with id = param.body.id
 */

app.get('/getGameById/:id', async (req, res) => {

  let canPass = true;
  let id = parseInt(req.params.id);


  if (Helpers.specialCharacter(req.params.id)) {
    canPass = false
  }

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
    res.sendStatus(400);
  }
});

/**
 * get a specific game by uuid
 * @param: uuid
 * @returns: game with uuid = param.body.uuid
 */

app.get('/getGameByUUID/:uuid', async (req, res) => {

  let canPass = true;


  if (Helpers.specialCharacter(req.params.uuid)) {
    canPass = false
  }
  if (canPass) {
    try {
      const result = await pg
        .select("*")
        .from("games")
        .where({
          uuid: req.params.uuid
        })
      if (result.length < 1) {
        res.status(404).send();
      } else {
        res.status(200).send(result);
      }
    } catch (error) {
      res.send(error);
    }

  } else {
    res.sendStatus(400);
  }
});

/**
 * get a specific player by uuid
 * @param: uuid
 * @returns: a player with uuid = param.body.uuid
 */

app.get('/getPlayerById/:id', async (req, res) => {

  if (Helpers.specialCharacter(req.params.id)) {
    res.sendStatus(400);
  } else {
    const result = await pg
      .select("*")
      .from("players")
      .where({
        uuid: req.params.id
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

/**
 * get all players
 * @param: none
 * @returns: json with all players on the database
 */

app.get('/getAllPlayers', async (req, res) => {

  const result = await pg.select("*").from("players");
  res.json({
    res: result,
  });

});

/**
 * delete a game by uuid
 * @param: uuid
 * @returns: status code
 */

app.delete('/deleteGame/:uuid', async (req, res) => {

  console.log("delete game");

  if (Helpers.specialCharacter(req.params.uuid)) {
    res.sendStatus(400);
  } else {
    const result = await pg
      .from("games")
      .where({
        uuid: req.params.uuid
      })
      .del().then((data) => {
        res.json(data);
      })
      .catch(() => res.status(404).send());
  }

});

/**
 * delete a player by uuid
 * @param: uuid
 * @returns: status code
 */

app.delete('/deletePlayer/:uuid', async (req, res) => {

  console.log("delete game");

  if (Helpers.specialCharacter(req.params.uuid)) {
    res.sendStatus(400);
  } else {
    const result = await pg
      .from("players")
      .where({
        uuid: req.params.uuid
      })
      .del().then((data) => {
        res.json(data);
      })
      .catch(() => res.status(404).send());
  }

});


///////////////////////////////
//        Analyze Data       //
///////////////////////////////


/**
 * calculate win percent by player
 * @param: uuid
 * @returns: float with value between 0-10
 */

app.get('/getWinPercentByPlayer/:id', async (req, res) => {

  if (Helpers.specialCharacter(req.params.id) || req.params.id === null || req.params.id === " " || typeof req.params.id !== "string") {
    res.sendStatus(400);

  } else {
    let totalGames;
    let WonGames;
    let result;

    const totalGamesResult = await pg
      .select("player_id")
      .from('played_games')
      .where({
        player_id: req.params.id
      }).then(async (data) => {
        totalGames = data.length
      })

      .catch((error) => {
        console.log(error);
      });


    const totalWonGamesResult = await pg
      .select("player_id")
      .from('played_games')
      .where({
        player_id: req.params.id,
        winner: true
      }).then(async (data) => {
        WonGames = data.length
        if (totalGames != 0 || wonGames === 0) {
          result = WonGames / totalGames;

        } else {
          result = 0;
        }

        if (result != null) {
          res.json({
            winrate: result,
          });
        } else {
          res.json({
            winrate: 0,
          });
        }


      })

      .catch((error) => {
        console.log(error);
      });
  }


});

/**
 * get games with a duration lower than x in seconds
 * @param: duration 
 * @returns: list of games who fullfill the criterea.
 */

//get all games with duration below x min
app.get('/getGamesByDuration/:duration', async (req, res) => {

  let duration = parseInt(req.params.duration);

  console.log("duration: " + duration);

  if (isNaN(duration) || duration === null || !Number.isInteger(duration)) {
    res.status(404).send();;
  } else {
    const result = await pg
      .select("*")
      .from("games")
      .where({
        duration: duration
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

///////////////////////////////
//       Create Tables       //
///////////////////////////////


async function initialiseTables() {
  await pg.schema.hasTable('players').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('players', (table) => {
          table.increments();
          table.uuid('uuid').notNullable().unique();
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
        }).catch((error) => {
          console.log(error);
        });;

    }
  });

  await pg.schema.hasTable('games').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('games', (table) => {
          table.increments();
          table.uuid('uuid').notNullable().unique();
          table.string('title');
          table.integer("rounds");
          table.integer("duration");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table games');
        })
        .catch((error) => {
          console.log(error);
        });

    }
  });

  await pg.schema.hasTable('played_games').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('played_games', (table) => {
          table.increments();
          table.uuid('game_id').unsigned().references("uuid").inTable("games").onDelete("CASCADE").onUpdate("CASCADE");
          table.uuid('player_id').unsigned().references("uuid").inTable("players").onDelete("CASCADE").onUpdate("CASCADE");
          table.boolean("winner");
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table played_games');

        }).catch((error) => {
          console.log(error);
        });

    }
  });
}
initialiseTables();

module.exports = app;