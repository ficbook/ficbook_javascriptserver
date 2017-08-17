/*jshint esversion: 6 */
/*globals require, __dirname, console*/

// убрать из массива элемент по его значению(только один элемент
// начиная с начала)
Array.prototype.exterminate = function (value) {
  this.splice(this.indexOf(value), 1);
};

import config from 'config';

import logger from '../logger';
import database from '../database';

const ddb = database.ddb;
const nddb = new ddb();

import express from 'express';
import http from 'http';
import https from 'https';

const app = express();
const server = http.createServer(app);

const confWebServer = config.get('webserver');

const myServ  = server.listen(confWebServer, function(){
  logger.info('web server start on', myServ.address());
});

const confWsServer = config.get('instans');

import uws from 'uws';

const WebSocketServer = uws.Server;

const wsServer = new WebSocketServer(confWsServer, function(){
  logger.info('Socket server start listen on', confWsServer);
});

const confPower = config.get('power_level');


import module_version from './version';
const t_version = new module_version.version(confPower, nddb,logger);

import module_rooms from './rooms';
const t_rooms = new module_rooms.rooms(confPower, nddb, logger);

import module_room from './room';
const t_room = new module_room.room(confPower, nddb, logger);

import module_chat from './chat';
const t_chat = new module_chat.chat(confPower, nddb, logger);

import module_authorization from './authorization';
const t_authorization = new module_authorization.authorization(confPower, nddb, logger);

import  module_administration from './administration';
const t_administration = new module_administration.administration(confPower, nddb, logger);

let rooms = [];

const peers =[];

t_rooms.load(function(rooms_l){
  rooms_l.forEach(function(item,i,arr){
    item.users = [];
  });
  rooms = rooms_l;
});

wsServer.on('connection', function(ws){
  logger.info((new Date())+'Соединение открыто');

  let login = '';
  let registered = false;
  let power = confPower.default;

  ws.on('message', function(message){
    let event;
    try {
      event = JSON.parse(message);
    }catch (err){
      logger.error('случилась ошибка: ', err);
      ws.close(4000,'ошибочный формат данных');
    }

    let date = new Date();
    if(event.type === 'autorize'){
      registered = t_authorization.authorization(
        ws,
        event,
        function(cc){
          registered = cc;
          login = event.login;
          if(registered){
            logger.info('Сейчас', peers.length, ' пользователей');
            logger.info('Поиск уже авторизованных логином и отправка им комманды на закрытие соединения: ', login);
            let count_to_kill = 0;
            for(let i = 0; i<  peers.length;i++){
              let peer = peers[i];
              if(peer.login === login){
                count_to_kill++;
                logger.info('Я убил уже', count_to_kill,'логинов', login);
                peer.ws.close(
                  4004,
                  'Соединение для '+ peer.login +' было на более свежее ');
              }}
            // ХЗ нужно оно ли здесь
            for(let i = 0; i<rooms.length;i++){
              for(let j = 0; j<rooms[i].users.length;j++){
                if((rooms[i].users[j].login=== login)&&(rooms[i].users[j].ws.readyState === rooms[i].users[j].ws.OPEN)){
                  rooms[i].users[j].ws.close(4004,'Соединение для '+ rooms[i].users[j].login + ' было заменено на более свежее ');
                }}}
            nddb.user.get_ban(login,function(ban){
              if(ban){
                const time_bun = new Date(ban.time_expired);
                const time_now = new Date();
                const reason = ban.reason;
                logger.info(time_bun);
                logger.info(time_now);
                logger.info(reason);
                if(time_bun>=time_now){
                  logger.info('должен непускаться', login, 'по причине ', reason);
                  const time_expired = time_bun - time_now;

                  if(ws.readyState===ws.OPEN){
                    try{
                      ws.close(4007, 'До конца бана '+time_expired + ' по причине: ' + reason);
                    } catch (err) {
                      logger.info('Однако, уже закрыто для логина: ', login);
                    }}}}else{
                logger.info(login,'не должон быть зобанен');
              }});
            nddb.user.get_power(event.login, function(pow){
              logger.info('получение силы');
              power = pow;
              let us;
              us = {'login': login, 'ws' : ws, 'power': power};
              peers.push(us);

              if(ws.readyState===ws.OPEN){
                try{
                  ws.send(
                    JSON.stringify({
                      'type':'status',
                      'action':'authorization',
                      'status':'success',
                      'power':power,
                      'login': login,
                      'password':event.password // вот это точно я хз нахрена
                    })
                  );
                } catch (err) {
                  logger.info('Однако, уже закрыто для логина: ', login);
                }}
              logger.info('Все пользователи ',peers.length);
            });
          }
          logger.debug('Результат проверки авторизации',registered);
        });
    } else {
      if(registered){
        switch(event.type){

        case 'version':
          t_version.version(power, login, ws, event);
          break;

        case 'rooms':
          logger.debug('у нас есть комнаты', rooms);
          t_rooms.list_rooms(power, login, rooms, ws, event);
          break;

        case 'room':
          t_room.room(power, login, ws, rooms, event, function(action,room){
            switch(action){
            case 'join':
              //rooms[].users[].login;
              const inRoom = function(us){
                return us.login === login;
              };
              const rooms_list_users = (l_rooms) =>{
                /*
                                logger.info('---===LIST_ROOMS===--');
                                for(let i = 0;i<l_rooms.length;i++){
                                    logger.info('>-',l_rooms[i].name,'-<');
                                    for(let j = 0;j<l_rooms[i].users.length;j++){
                                        logger.info('>',l_rooms[i].users[j].login);
                                    }
                                    logger.info('>-',l_rooms[i].name,'-<');
                                }
                                logger.info('---===LIST_ROOMS===--');
*/
              };


              for(let i=0;i<rooms.length;i++){
                if(rooms[i].name === room){
                  if(rooms[i].users.some(inRoom)){
                  } else {
                    rooms[i].users.push({'login': login.toString(),'ws':ws});
                    rooms_list_users(rooms);
                    for(let j = 0; j<rooms[i].users.length; j++){
                      if(rooms[i].users[j].ws.readyState === rooms[i].users[j].ws.OPEN){
                        try{
                          rooms[i].users[j].ws.send(
                            JSON.stringify({
                              'type':'event',
                              'action':'join',
                              'users_count':rooms[i].users.length,
                              'user_name':login,
                              'room_name':room
                            })
                          );
                        } catch (err) {
                          logger.info('Однако, уже закрыто для логина: ', rooms[i].users[j].login, ' в комнате',rooms[i].name);
                        }}}}} else {
                  // неправильно считается
                  // количество народа
                  // така удаляется
                  // только один, то от
                  // сюда и баг  нужно
                  // переписать на
                  // настощий цикл с флагами
                  if(rooms[i].users.some(inRoom)){
                    const users_count = rooms[i].users.length - 1;
                    for(let  j = 0;j<rooms[i].users.length;j++){
                      if(rooms[i].users[j].login===login){
                        rooms[i].users.splice(j,1);
                        j--;
                      } else{
                        if(rooms[i].users[j].ws.readyState === rooms[i].users[j].ws.OPEN){
                          try{
                            rooms[i].users[j].ws.send(
                              JSON.stringify({
                                'type':'event',
                                'action':'leave',
                                'users_count':users_count,
                                'user_name':login,
                                'room_name':room
                              }));
                          } catch (err){
                            logger.info('Однако, уже закрыто для логина: ', rooms[i].users[j].login,' в комнате ',rooms[i].name);
                          }}}}}}}


              rooms_list_users(rooms);
              break;

            case 'left':

              break;
            default:
              break;
            }
          });
          break;

        case 'chat':
          t_chat.chat(power, login , ws, event, rooms);
          break;

          //есть проблемы с силой у администратора
        case 'administration':
          t_administration.administration(login, rooms, ws, event, function(action){
            switch(action){
            case'kik':
              for(let i=0; i<rooms.length;i++){
                for(let j=0;j<rooms[i].users.length;j++){
                  if(rooms[i].users[j].login===event.user_name){
                    for(let k=0; k<rooms[i].users.length;k++){
                      if(rooms[i].users[k].login!==event.user_name){
                        if(rooms[i].users[k].ws.readyState===rooms[i].users[k].ws.OPEN){
                          try{
                            rooms[i].users[k].ws.send(
                              JSON.stringify({
                                type:'event',
                                action: 'kiked',
                                'users_count':rooms[i].users.length,
                                user_name:event.user_name,
                                room_name: rooms[i]
                              }));
                            rooms[i].users[k].ws.send(
                              JSON.stringify({
                                type:'event',
                                action: 'custom',
                                message: event.user_name +'\nwill be'
                                  + ' kiked by \n' + event.message + ''
                                  + ' \n by ' +login
                              }));
                          } catch (err) {
                            logger.info('Однако, уже закрыто для логина: ', rooms[i].users[k].login,' в комнате ',rooms[i].name);
                          }}else{
                          rooms[i].users[k].ws.close(4006,event.message);
                        }}}}}}
              for(let i = 0; i < peers.length; i++) {
                if (peers[i].login===event.user_name) {
                  peers[i].ws.close(4006,event.message);
                }
              }
              break;
            case'ban':
              for(let i=0; i<rooms.length;i++){
                for(let j=0;j<rooms[i].users.length;j++){
                  if(rooms[i].users[j].login===event.user_name){
                    for(let k=0; k<rooms[i].users.length;k++){
                      if(rooms[i].users[k].ws.readyState===rooms[i].users[k].ws.OPEN){
                        if(rooms[i].users[k].login!==event.user_name){
                          if(rooms[i].users[k].ws.readyState===rooms[i].users[k].ws.OPEN){
                            try{
                              rooms[i].users[k].ws.send(
                                JSON.stringify({
                                  type:'event',
                                  action:'kiked',
                                  'users_count':rooms[i].users.length,
                                  user_name: event.user_name
                                }));
                            } catch (err) {
                              logger.info('Однако, уже закрыто для логина: ', rooms[i].users[k].login,' в комнате ',rooms[i].name);
                            }
                          }}else{
                          rooms[i].users[k].ws.close(4007,event.message);
                        }}}}}}

              for(let i = 0; i < peers.length; i++) {
                if (peers[i].login===event.user_name) {
                  peers[i].ws.close(4006,event.message);
                }
              }
              break;
            case 'destroy':
              for(let i=0;i<rooms.length;i++){
                if(rooms[i].name ===  event.room_name){
                  logger.info(event);
                  rooms.splice(i,1);
                  logger.info('комната',event.room_name,'удалена');
                }}
              break;
            default:
              break;
            }
          });
          break;

        default:
          logger.info('комманда',event,'нераспознана');
          break;
        }
      }
    }

    let connection = message.accept;
  })
  ;

  //проблемы при закрытии вангую я
  ws.on('close', function(code,message){
    logger.info('Клиент отключился', login, 'причина закрытия',code, 'Сообщение закрытия',message);

    //ошибка при обработки покидания комнаты на сервере
    for(let i=0;i<rooms.length;i++){
      for(let j=0; j<rooms[i].users.length; j++){
        if(rooms[i].users[j].login===login){
          logger.info('логин для удаления',rooms[i].users[j].login);
          rooms[i].users.splice(j,1);
          j--;
          logger.info(login,'удален из', rooms[i].name);
        }}}


    for(let i = 0; i< peers.length; i++){
      if(peers[i].ws === ws){
        logger.info(peers[i].login,'убран из общего списка соединенией');
        peers.splice(i,1);
        i--;
      }}

  });
});
