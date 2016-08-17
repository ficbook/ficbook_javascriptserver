/*jshint esversion: 6 */
/*globals require, __dirname, console, module*/

const config = require('config');
const logger = require ('../logger');

const mydbserver = config.get('database');
const db = mydbserver.database;
const max = config.get('max');

let list_rooms = [];

const knex = require('knex')({
    client: 'mysql',
    connection: mydbserver
});

const module_init = require('./init');
const t_init = module_init.init;

const module_user = require('./user');
const t_user = module_user.user;

const module_rooms = require('./rooms');
const t_rooms = module_rooms.rooms;

const module_room = require('./room');
const t_room = module_room.room;

const module_autorize = require('./autorize');
const t_autorize = module_autorize.autorize;

const module_chat = require('./chat');
const t_chat = module_chat.chat;

const module_administration = require('./administration');
const t_administration = module_administration.administration;

const close = function(){
    knex.destroy();
};



const ddb = function(){
    logger.info("ddb object invok");
    this.test =()=>{
        logger.info("ddb test cal");
    };
    this.init_db =()=>{
        t_init(knex, logger);
    };
    this.close =()=>{
        close();
    };
    this.user =  new t_user(knex, logger);
    this.room =  new t_room(knex, logger);
    this.rooms = new t_rooms(list_rooms, knex, logger);
    this.autorize  = new t_autorize(knex, logger);
    this.chat = new t_chat(knex, logger);
    this.administration = new t_administration(knex, logger);
};


module.exports.ddb = ddb;

logger.info('database initilization');

