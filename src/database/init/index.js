/*jshint esversion: 6 */
/*globals require, console, module*/


const config = require('config');
const mydbserver = config.get('database');

const db = mydbserver.database;
const max = config.get('max');

const create_users = (knex, logger) =>{
    knex.schema.withSchema(db).createTable('users', function (table) {
        table.increments('id');
        table.binary('login', max.login).unique().notNullable();
        table.binary('password').notNullable();
        table.integer('power').defaultTo(0);
        table.timestamp('date_reg').defaultTo(knex.fn.now());
        table.timestamp('date_visit').defaultTo(knex.fn.now());
        table.string('user_name');
    })
        .catch(function(e) {
            logger.error(e);
        });
    logger.info('create in', db,'table  users');
};

const create_chat_rooms =(knex, logger)=>{
    knex.schema.withSchema(db).createTable('chat_rooms', function(table){
        table.increments('id');
        table.binary('name', max.chat.name).unique().notNullable();
        table.string('topic',max.chat.topic);
        table.text('about');
    })
        .catch(function(e) {
            logger.error(e);
        });
    logger.info('create in', db,'table  chat_rooms');
};

const create_chat_message_all=(knex, logger)=>{
    knex.schema.withSchema(db).createTable('chat_message_all', function(table){
        table.increments('id');
        table.binary('login', max.login).index().notNullable();
        table.text('message').notNullable();
        table.timestamp('timestamp').defaultTo(knex.fn.now());
        table.index('timestamp');
        table.integer('room_id').index().notNullable();
        table.index('room_id');
    })
        .catch(function(e) {
            logger.error(e);
        });
    logger.info('create in', db,'table  chat_message_all');
};

const create_subscriptions=(knex,logger)=>{
    knex.schema.withSchema(db).createTable('subscriptions', function(table){
        table.increments('id');
        table.binary('login', max.login).index().notNullable();
        table.integer('room_id').index().notNullable();
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    })
        .catch(function(e) {
            logger.error(e);
        });
    logger.info('create in', db,'table  subscriptions');
};

const create_bans_list=(knex, logger)=>{
    knex.schema.withSchema(db).createTable('bans_list',function(table){
        table.increments('id');
        table.binary('login_banned', max.login).index().notNullable();
        table.binary('login_banning', max.login).index().notNullable();
        table.text('reason').notNullable();
        table.timestamp('time_ban').notNullable();
        table.timestamp('time_expired').notNullable();
    })
        .catch(function(e){
            logger.error(e);
        });
    logger.info('create in', db, 'table  bans_list');
};

const init =(knex, logger)=> {
    create_users(knex,logger);
    create_chat_rooms(knex,logger);
    create_chat_message_all(knex,logger);
    create_subscriptions(knex,logger);
    create_bans_list(knex,logger);
};



module.exports.init = init;
