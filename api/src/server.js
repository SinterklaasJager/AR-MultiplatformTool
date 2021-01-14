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
const { isString } = require('util');

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
      res.status(201).send("Game was saved");
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
  res.json({
    res: result,
  });

});



app.get('/getGameById/:id', async (req, res) => {

  let canPass = true;
  let id = parseInt(req.params.id);


  if(Helpers.specialCharacter(req.params.id)){
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


app.get('/getPlayerById/:id', async (req, res) => {

  if(Helpers.specialCharacter(req.params.id)){
    res.sendStatus(400);
  }else{
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
  }

});

app.get('/getAllPlayers', async (req, res) => {

  const result = await pg.select("*").from("players");
  res.json({
    res: result,
  });

});


app.delete('/deleteGame/:uuid', async (req, res) => {

  console.log("delete game");

  if(Helpers.specialCharacter(req.params.uuid)){
    res.sendStatus(400);
  }else{
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


///////////////////////////////
//        Analyze Data       //
///////////////////////////////

app.get('/getWinPercentByPlayer/:id', async (req, res) => {

if( Helpers.specialCharacter(req.params.id) || req.params.id === null || req.params.id ===" " || typeof req.params.id !== "string"){
res.sendStatus(400);

}else{
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
      result = WonGames / totalGames;
      res.json({
        winrate: result,
      });
    
    })
     
    .catch((error) => {
      console.log(error);
    });
}

  


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
          table.uuid('uuid');
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
        });

    }
  });

  await pg.schema.hasTable('played_games').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('played_games', (table) => {
          table.increments();
          table.string('game_id');
          table.string('player_id');
          table.boolean("winner");
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