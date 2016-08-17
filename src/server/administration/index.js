/*jshint esversion: 6 */
/*globals module */
const administration = function(confPower, nddb, logger){
    const administration = function(login, rooms, ws, event, cb){
        switch(event.action){
        case 'create':
            switch(event.object){
            case 'room':
                nddb.user.get_power(login, function(power){
                    logger.info('и силу получил я', power);
                    if(power >= confPower.administrator){
                        const name = event.name;
                        if(name!==undefined){
                            logger.debug(
                                "получена комманда на добавление комнаты",
                                name);
                            if(nddb.rooms.add_room(name)){
                                const room={
                                    "name": name,
                                    "topic": '',
                                    "about": '',
                                    "users":[]};
                                logger.debug('Добавлена комната',room);
                                rooms.push(room);
                                logger.info("Комната", name ,"успешно добавлена");
                                try{
                                    ws.send(
                                        JSON.stringify({
                                            'type':'status',
                                            'action':'create',
                                            'status':'sucsessfull'
                                        }));
                                }catch(err){
                                    logger.info('отправки статуса успешного создания комнаты', room);
                                }                                
                            } else {
                                logger.debug("Комната", name, "уже существует" );
                                try{
                                    ws.send(
                                        JSON.stringify({
                                            'type':'status',
                                            'action':'create',
                                            'status':'error',
                                            'cause':'exist',
                                            'object':'room',
                                            'subject':'room exist'
                                        }));
                                }catch(err){
                                    logger.info('Ошибка: отправка сообщения о об ошибки создания комнаты ', name, ' в уже закрытый сокет для ', login);
                                }
                            }
                        } else {
                            logger.info("Комнаты с пустым именем недопустимы");
                            try{
                                ws.send(
                                    JSON.stringify({
                                        'type':'status',
                                        'action':'create',
                                        'status':'error',
                                        'cause':'null name',
                                        'object':'room',
                                        'subject':'room need name'                     
                                    }));
                            }catch(err){
                                logger.info('Ошибка: отправа сообщение об ошибке создания комнаты в закрытый сокет для', login);
                            }}
                    } else{                                            
                        logger.info('нехватает силы');
                        try{
                            ws.send(
                                JSON.stringify({
                                    'type':'status',
                                    'action':'set',
                                    'status':'error',
                                    'cause':'too few',
                                    'object':'room',
                                    'subject':'power few'
                                }));
                        }catch(err){
                            logger.info('Ошибка отправки сообщения об нехватки силы для создания комнаты', event.name,'для', login);
                        }
                    }});
                break;                

            default:
                logger.debug("неправильная комманда",event);
                break;                
            }

            break;

            // сделать корректное удаление комнаты
        case 'destroy':
            switch(event.object){
            case 'room':
                
                nddb.user.get_power(login, function(power){
                    logger.info('и силу получил я', power);
                    if(power>= confPower.administrator){
                        nddb.rooms.remove_room(event.room_name);
                        for(let i = 0;i<rooms.length;i++){
                            if(rooms[i].name === event.room_name){
                                const message_text='Эта комната была удалена';
                                logger.info(rooms[i].name);
                                for(let j =0; j<rooms[i].users.length;j++){
                                    if(rooms[i].users[j].ws.readyState === rooms[i].users[j].ws.OPEN){
                                        try{
                                            rooms[i].users[j].ws.send(
                                                JSON.stringify({
                                                    'type':'event',
                                                    'action':'custom',
                                                    'message':message_text
                                                }));
                                        } catch(err){
                                            logger.info('Ошибка: попытка отправить сообщение об удалении',event.room_name,'в закрытый сокет для', rooms[i].users[j],login);
                                        }}}                                
                                cb('destroy');
                            }}}});                
                break;
                
            default:
                break;
            }
            break;
            
        case 'rename':
            switch(event.object){
            case 'room':
                
                break;
            default:
                break;
            }
            break;
            
        case 'kik':       
            if((event.user_name)&&(event.message)){
                cb('kik');
            }
            break;

        case 'ban':

            nddb.user.get_power(login, function(power){
                logger.info('и силу получил я', power);
                if(power >= confPower.administrator){
                    if((event.user_name)&&(event.message)&&(event.duration)){
                        logger.info('поля на месте');                        
                        nddb.administration.ban_user(event.user_name, login, event.message, event.duration);
                        cb('ban');
                    }}});
            
            break;
            
        default:
            logger.debug("неправильная комманда",event);
            break;
            
        }};
    this.administration = administration;
};

module.exports.administration = administration;
