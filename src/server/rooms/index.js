/*jshint esversion: 6 */
/*globals module */


const rooms = function(powerConfig,  nddb, logger){

    const rooms_list =(cb)=>{
        const l_rooms = [];
        nddb.rooms.list(function(rooms){
            logger.debug('Всего комнат',rooms.length);
            rooms.forEach(function(item, i, arr) {
                const room={
                    "name": item.name,
                    "topic": item.topic,
                    "about": item.about
                };
                logger.debug(room);
                l_rooms.push(room);
            });
            cb(l_rooms);
        });    
    };
    
    this.list_rooms_from_db =(power, login, ws, event)=>{
        switch(event.action){
        case "get":

            if(power=> powerConfig.user){
                
                rooms_list(function(rooms_l){
                    try{
                    ws.send(
                        JSON.stringify({
                            'type':'rooms',
                            'list': rooms_l
                        }));
                    } catch(err){
                        logger.info('Ошибка: отправка в уже закрытый сокет для ', login);
                    }
//                    logger.info(rooms_l);
                });
            } else{
                try{
                ws.send(
                    JSON.stringify({
                        'type':'status',                       
                        'action':'get',
                        'status':'error',
                        'cause':'too few',
                        'object':'rooms list',
                        'subject':'need more power'
                    }));                
                }catch(err){
                    logger.info('Ошибка: отправка сообщения об ошибке для', login);
                }}
            
            break;
            
        default:
            logger.info("действие",event,"Ошибка в комманде");
            break;
        }
    };

    this.list_rooms=(power, login, rooms, ws, event)=>{
        switch(event.action){
        case "get":
            if(power=> powerConfig.user){
                let rooms_on = rooms.map(function(room){
                    const name = room.name;
                    const topic = room.topic;
                    const about = room.about;
                    const count_users = room.users.length;
                    return {'name': name,
                            'topic': topic,
                            'about': about,
                            'count_users': count_users};
                });
                try{
                ws.send(
                    JSON.stringify({
                        'type':'rooms',
                        'list': rooms_on
                    }));
                }catch(err){
                    logger.info('Ошибка отправки в закрытый сокет списка комнат для ', login);
                }
            } else{
                try{
                ws.send(
                    JSON.stringify({
                        'type':'status',                        
                        'action':'get',
                        'status':'error',
                        'cause':'too few',
                        'object':'rooms list',
                        'subject':'need more power'                        
                    }));
                }catch(err){
                    logger.info('Ошибка: отправка статуса об недостаточности силы для ', login);
                }}                       
            break;
            
        default:
            logger.info("действие",event,"Ошибка в комманде");
            break;
        }
    };

    this.load = function(cb){
        rooms_list(function(rooms_list){
            cb(rooms_list);
        });
    };  
};

module.exports.rooms = rooms;
