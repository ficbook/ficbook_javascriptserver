const chat = function(confPower, nddb, logger){
  const chat = function(power, login, ws, event, rooms){
    const roomIS = function(room){
      return rooms.some(function(ite){
        return ite.name === room;
      });
    };
    switch(event.action){
    case 'send':{
      switch(event.subject){
      case 'message':
        if((event.message!==undefined)&&( event.room_name !== undefined) ){
          if(roomIS(event.room_name)){
            nddb.chat.message(
              login, event.message, event.room_name,
              function(){
                logger.info(login,'to',event.room_name,'message:', event.message);
              });
            //rooms[].users[].login;
            rooms.forEach(function(item){
              if(item.name===event.room_name){
                const time = Date.now();
                item.users.forEach(function(user){
                  if (user.ws.readyState === user.ws.OPEN) {
                    try{
                      user.ws.send(
                        JSON.stringify({
                          'type':'chat',
                          'object':'message',
                          'user': login,
                          'room_name': event.room_name,
                          'message': event.message,
                          'time': time
                        }));
                    }catch(err){
                      logger.info('Ошибка отправки сообщения для закрытого сокета юзаера', user.login);
                    }}});
              }});
          } else {
            logger.info('Комнаты', event.room_name, 'Несуществует');
          }
          //TODO тут можно слать сообщение в любую комнату, даже если
          // не зашел и это нужно исправить
        }
        break;
      default:
        break;
      }
      break;
    }
    case 'get':
      switch(event.subject){
      case 'history':
        //нет проверки на существование комнаты
        logger.info(event);
        if((event.timestamp)&&(event.count)){
          if(roomIS(event.room_name)){
            nddb.chat.history(
              event.room_name,
              event.timestamp,
              event.count,
              function(messages){
                for(let i=0;i<messages.length;i++){
                  messages[i].timestamp = Date.parse(messages[i].timestamp);
                }
                if(ws.readyState == ws.OPEN){
                  try{
                    ws.send(
                      JSON.stringify({
                        'type':'history',
                        'name':event.room_name,
                        'messages': messages
                      }));
                  }catch(err){
                    logger.info('Ошибка отправки сообщений истории для', login);
                  }}});
          } else {
            if(ws.readyState == ws.OPEN){
              try{
                ws.send(
                  JSON.stringify({
                    'type':'status',
                    'action':'get',
                    'status':'error',
                    'cause':'room not exist',
                    'object':'history',
                    'subject':'room should exist'
                  }));
              }catch(err){
                logger.info('Ошибка отправки сообщения об ошибке получения истории для ', login);
              }}}}

        break;

      case 'participants':
        let users=[];
        if(event.room_name){
          for(let i=0; i<rooms.length;i++){
            if(rooms[i].name === event.room_name){
              for(let j=0;j<rooms[i].users.length; j++){
                if(rooms[i].users[j].ws.readyState===rooms[i].users[j].ws.OPEN){
                  users.push(rooms[i].users[j].login);
                }}
              if(ws.readyState == ws.OPEN){
                try{
                  ws.send(
                    JSON.stringify({
                      type:'chat',
                      action:'get',
                      object:'participants',
                      room_name:event.room_name,
                      participants: users
                    }));
                }catch(err){
                  logger.info('Ошибка отправки колличества учестников в комнате для пользователя ', login, ' в комнате ',event.room_name);
                }}
            }}}
        break;
      case 'bans':
        break;
      default:
        break;
      }
      break;

    case 'search':
      if((event.room_name!==undefined)&&(event.query!==undefined)){
        nddb.chat.search(event.room_name, event.query, function(row){
          if (ws.readyState === ws.OPEN) {
            try{
              ws.send(
                JSON.stringify({
                  'type':'chat',
                  'object': 'search',
                  'room_name': event.room_name,
                  'query':event.query,
                  'history': row
                }));
            }catch(err){
              logger.info('Ошибка отправки сообщения для закрытого сокета юзаера', login);
            }}});
      }
      break;
    case 'kik':
      switch(event.subject){
      case 'id':
        break;
      default:
        break;
      }
      break;

    case 'ban':
      switch(event.subject){
      case 'id':
        break;
      default:
        break;
      }
      break;

    case 'set':
      switch(event.subject){
      case 'name':
        break;
      case 'topic':
        break;
      default:
        break;
      }
      break;

    default:
      break;

    }
  };
  this.chat = chat;
};



module.exports.chat = chat;
