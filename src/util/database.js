/*jshint esversion: 6 */
/*globals require, __dirname, console*/

const config = require('config');
//const logger = require ('../logger');

const database = require('../database');
const ddb = database.ddb;
const nddb = new ddb();

nddb.init_db();
nddb.close();
console.log('db util');

