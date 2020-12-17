const express = require('express')
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const { doesNotMatch } = require('assert');

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
  

  // async function initialiseTables() {
  //   await pg.schema.hasTable('users').then(async (exists) => {
  //     if (!exists) {
  //       await pg.schema
  //         .createTable('users', (table) => {
  //           table.increments();
  //           table.uuid('uuid');
  //           table.string('content');
  //           table.timestamps(true, true);
  //         })
  //         .then(async () => {
  //           console.log('created table users');
  //         });
  
  //     }
  //   });
  //   await pg.schema.hasTable('story').then(async (exists) => {
  //     if (!exists) {
  //       await pg.schema
  //         .createTable('story', (table) => {
  //           table.increments();
  //           table.uuid('uuid');
  //           table.string('title');
  //           table.string('summary');
  //           table.timestamps(true, true);
  //         })
  //         .then(async () => {
  //           console.log('created table story');
  //           for (let i = 0; i < 10; i++) {
  //             const uuid = Helpers.generateUUID();
  //             await pg.table('story').insert({ uuid, title: `random element number ${i}` })
  //           }
  //         });
          
  //     }
  //   });
  // }
  // initialiseTables();

module.exports = app;