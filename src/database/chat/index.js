/*jshint esversion: 6 */
/*globals require, console, module*/

const chat = function(knex, logger){
    const message =(login, message, room_name, cb)=>{
        knex('chat_message_all')
            .insert(
                knex.raw(
                    '(login, message, room_id) values (:login ,:message, (select id from  `chat_rooms` where `name`=:room_name))',
                    {
                        login:login,
                        message:message,
                        room_name:room_name
                    }
                ))
            .then(cb())
            .catch(function(e) {
                logger.error(e);
            });
    };
    const history = (room_name,timestamp,count,cb)=>{
        logger.info("Получен там стамп:",timestamp);
        if((count>0)&&(timestamp>0)){
            knex('chat_message_all')
                .select(
                    'login',
                    'message',
                    'timestamp'
                )
                .join(
                    'chat_rooms',
                    'chat_rooms.id',
                    'chat_message_all.room_id'
                )
                .where(
                    'chat_rooms.name',
                    room_name
                )
                .andWhere(                
                    'timestamp','<',  new Date(timestamp)
                )
                .orderBy('chat_message_all.id','desc')
                .limit(count)
                .then(
                    function(rows) {
                        if (rows.length === 0) {
                            cb([]);
                        } else {
                            rows.forEach(function(item,i,arr){
                                item.login = item.login.toString();
                            });
                            cb(rows);          
                        }
                    })
                .catch(function(e) {
                    logger.error(e);
                });
        }
    };
    this.history = history;
    this.message = message;
};

module.exports.chat = chat;

