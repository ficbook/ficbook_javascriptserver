/*jshint esversion: 6 */
/*globals module */

const version = function(confPower, nddb, logger){
    this.version=(power, login, ws,event)=>{
        switch(event.action){
        case'get':
            try{
                ws.send(
                    JSON.stringify({
                        'type':'version',
                        'version':'1'
                    }));
            }catch(err){
                logger.info('Ошибка отправки сообщения в закрытый сокет для ', login);
            }
            break;

        default:
            break;
        } 
    };
};


module.exports.version = version;

