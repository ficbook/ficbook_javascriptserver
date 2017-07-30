import config from 'config';

//const logger = require ('../logger');

import database from '../database';

const ddb = database.ddb;
const nddb = new ddb();

nddb.init_db();
nddb.close();

console.log('db util');

