/*jshint esversion: 6 */
/*globals module */

const room = function(powerConfig,  nddb,  logger ){ 

    const room =(power, login, ws, rooms, event, cb) =>{
        switch(event.action){
            
        case "get":
            switch(event.subject){
            case "topic":
                nddb.room.get.topic(
                    event.room_name,function(topic){
                        try{
                            ws.send(
                                JSON.stringify({
                                    type:'room',
                                    action:'get',
                                    room_name:event.room_name,
                                    topic:topic[0].topic
                                }));
                        }catch(err){
                            logger.info('Отправка в закрытый сокет ответа для ',login,' на получение topic',event.room_name);
                        }                        
                        logger.info(topic);
                    });                            
                break;
            case "about":
                nddb.room.get.about(
                    event.room_name,function(about){
                        try{
                        ws.send(
                            JSON.stringify({
                                type:'room',
                                action:'get',
                                room_name:event.room_name,
                                about:about[0].about
                            }));
                        } catch(err){
                            logger.info('Отправка в закрытый сокет ответа для ',login,' на получение about',event.room_name);
                        }
                        logger.info(about);
                    });
                break;
            case "online":
                break;
            default:
                break;
            }
            break;
            
        case "set":    
            switch(event.subject){          
            case "topic":
                if(power >= powerConfig.moderator){
                    if(event.topic){
                        nddb.room.set.topic(
                            event.room_name,event.topic);
                    }  else  {
                        try{
                        ws.send(
                            JSON.stringify({
                                'type':'status',
                                'action':'set',
                                'status':'error',
                                'cause':'none data',                                
                                'object':'topic',
                                'subject':'data error'
                            })
                        );
                        } catch(err){
                            logger.info('Ошибка отправки ошибки ',login,' при установки топика: ошибка данных');
                        }
                    }
                }else{
                    try{
                    ws.send(
                        JSON.stringify({
                            'type':'status',
                            'action':'set',
                            'status':'error',
                            'cause':'too few',
                            'object':'topic',
                            'subject':'power few'
                        })
                    );
                    } catch(err){
                        logger.info('Ошибка отправки ошибки ',login,' при установки топика: сликом мало силы');
                    }
                }
                break;
                
            case "about":
                if(power >= powerConfig.moderator){
                    if(event.about){
                        nddb.room.set.about(
                            event.room_name,event.about);
                    } else  {
                        try{
                        ws.send(
                            JSON.stringify({
                                'type':'status',
                                'action':'set',
                                'status':'error',
                                'cause':'none data',
                                'object':'about',
                                'subject':'data error'                                
                            })
                        );
                        } catch(err){
                            logger.info('Ошибка отправки ',login ,' ошибки при установки about: ошибка данных');
                        }
                    }
                } else {
                    try{
                    ws.send(
                        JSON.stringify({
                            'type':'status',
                            'action':'set',
                            'status':'error',                            
                            'cause':'too few',
                            'object':'about',
                            'subject':'power'
                        })
                    );
                    } catch(err){
                        logger.info('Ошибка отправки ',login,' ошибки при установки about: сликом мало силы');
                    }
                }
                break;
                
            default:
                break;
            }                
            
            break;
            
        case "join":
            nddb.rooms.list(function(l_rooms){
                // присоединиться можно только, если комната присутсвует в
                // списке               
                const r_name = event.room_name;
                if(r_name){
                    if(l_rooms.some(function(item){
                        return item.name === r_name;
                    })){
                        logger.info("Комната", r_name, "Есть в списке комнат");
                        nddb.room.subscribe(login,r_name,function(){
                            cb(event.action, r_name);
                        });
                    }

                    nddb.chat.history(
                        event.room_name,
                        Date.now(),
                        10,
                        function(messages){
                            for(let i=0; i<messages.length;i++){
                                messages[i].timestamp = Date.parse(messages[i].timestamp);
                            }
                            try{       
                            ws.send(
                                JSON.stringify({
                                    "type":"history",
                                    "name":event.room_name,
                                    "messages": messages
                                }));
                            } catch(err){
                                logger.info('Ошибка отправки истории для', login);
                            }});

                    nddb.room.get.topic(
                        event.room_name,
                        function(topic){
                            try{
                                ws.send(
                                    JSON.stringify({
                                        type:'room',
                                        action:'get',
                                        room_name:event.room_name,
                                        topic:topic[0].topic
                                    }));
                            }catch(err){
                                logger.info('Отправка в закрытый сокет ответа для ',login,' на получение topic',event.room_name);
                            }
                            logger.info(topic);
                        });
                } else{
                    logger.info('неуказана комната');
                }

                
            });
            break;
        case "left":
            if(event.room_name){
                nddb.room.unsubscribe(login,event.room_name);
                
                for(let i=0; i<rooms.length; i++){
                    if(rooms[i].name === event.room_name){
                        for(let j=0; j<rooms[i].users.length; j++){
                            if(rooms[i].users[j].login === login){
                                rooms[i].users.splice(j,1);
                            } else {
                                try{
                                    rooms[i].users[j].ws.send(
                                    JSON.stringify({
                                        'type': 'event',
                                        'action':'left',
                                        'user_name': login,
                                        'room_name': event.room_name
                                    }));
                                } catch(err){
                                    logger.info('Ошибка отправки сообщения об уходе в комнате ',event.room_name,' для закрытого сокета', rooms[i].users[j].login);
                                }}}}}}
            
            break;
        default:
            logger.info("действие",event,"нераспознано");
            break;
        }
        
    };
    this.room = room;
};



module.exports.room = room;

