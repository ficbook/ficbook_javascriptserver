/*jshint esversion: 6 */
/*globals require, console, module*/

const room = function(knex, logger){
    const get = function(){       
        const get_topic = (name, callback) =>{
            knex('chat_rooms')
                .select(
                    'topic')
                .where(
                    'name',"=", name)
                .then(function(rows) {
                    if (rows.length === 0) {
                        callback();
                    } else {
                        callback(rows);          
                    }
                })       
                .catch(function(e){
                    logger.info("error in find topic by name",e);
                });
        };
        const get_about = (name, callback) =>{
            knex('chat_rooms')
                .select(
                    'about')
                .where(
                    'name',"=", name)
                .then(function(rows) {
                    if (rows.length === 0) {
                        callback();
                    } else {
                        callback(rows);          
                    }
                })       
                .catch(function(e){
                    logger.info("error in find about by name",e);
                });
        };  

        this.topic =  get_topic;
        this.about = get_about;
    };

    const set = function(){
        const set_topic = (name, topic) =>{
            knex('chat_rooms')
                .where(
                    'name','=', name)
                .update({
                    'topic': topic
                })
                .catch(function(e){
                    logger.info("error modifity topic",e);
                });
        };
        const set_about = (name, about) =>{
            knex('chat_rooms')
                .where(
                    'name','=', name)
                .update({
                    'about': about
                })
                .catch(function(e){
                    logger.info("error modifity about",e);
                });
        };
        this.about = set_about;
        this.topic = set_topic;
    };

    const is_subscribed = function(login, room_name, cb){
        /*
          select * from `subscriptions`
          where `login` ='test'
          and
          room_id =
          (select id from chat_rooms where `name` = 'rr');
        */
        //    идея неправильная
        knex('subscriptions')
            .select()
            .where(
                knex.raw(
                    '`login` =:login and room_id = (select id from chat_rooms where `name` = :room_name)',
                    {
                        login: login,
                        room_name: room_name
                    }
                ))
            .then(function(rows) {
                //            logger.info('найденная комната',rows);
                if (rows.length === 0) {
                    logger.info("неподписан");
                    cb();
                } else {
                    rows.map(item =>{        
                        cb(item);
                    });
                }
            })
            .catch(function(e) {
                logger.error(e);
            });
    };
    
    const subscribe_to_room = function(login, room_name,cb){
        /*
          insert into `subscriptions`
          (login, room_id) values
          ('www',(select id from `chat_rooms` where `name`='rr'));
        */
        // при возможности заменить на более человеко-доброе

        is_subscribed(login, room_name, function(cc){
            if(cc){
                logger.info('уже подписан');
                cb();
            } else {
                logger.info('Добавляется',login, 'в комнату', room_name);
                knex('subscriptions')
                    .insert(
                        knex.raw(
                            '(login, room_id) values (:login , (select id from  `chat_rooms` where `name`=:room_name))',
                            {
                                login:login,
                                room_name:room_name
                            }
                        ))
                    .then(cb())
                    .catch(function(e) {
                        logger.error(e);
                    });
            }
        });
    };

    const unsubscribe_to_room = function(login, room_name){
        /*
          delete from  `subscriptions`
          where `login` = 'test'
          and
          `room_id` =
          (select id from `chat_rooms` where `name` = 'rr');
        */
        logger.info('Удаляется',login, 'из комнаты', room_name);
        knex('subscriptions')
            .where(
                knex.raw(
                    '`login` =:login and room_id = (select id from chat_rooms where `name` = :room_name)',
                    {
                        login: login,
                        room_name: room_name
                    }
                ))
            .del()
            .catch(function(e) {
                logger.error(e);
            });
    };

    
    this.unsubscribe = unsubscribe_to_room;
    this.subscribe = subscribe_to_room;  
    this.get = new get();
    this.set = new set();
};



module.exports.room = room;
