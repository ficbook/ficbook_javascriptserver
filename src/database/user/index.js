/*jshint esversion: 6 */
/*globals module */

const user = function(knex,logger){
    const finduser =(username,callback)=>{
        logger.info('вызван finduser');
        knex('users')
            .where({
                login: username
            }).select()
            .then(function(rows) {
                if (rows.length === 0) {
                    logger.info('никого не найдено');
                    callback();
                } else {
                    //logger.debug('найдено с помощью finduser',rows);
                    rows.map(item =>{
                        //logger.debug("редуцираем", item);
                        callback(item);
                    });
                }
            })
            .catch(function(e){
                logger.info('error in find user select',e);
            });
    };
    const adduser=(username,password)=>{
        logger.info('Добавляется',username);
        knex('users').insert({
            login: username,
            password: password,
            user_name: 'NONE'
        })
            .catch(function(e) {
                logger.error(e);
            });
    };

    const get_power=(username, cc)=>{
        finduser(username, function(rr){
            logger.debug('Начало поиска');
            if(rr){
                cc(rr.power);
            } else{
                cc(0);
                logger.debug('что-то никого не найдено');
            }
        });
    };

    this.get_power=(username, cc)=>{
        get_power(username, cc);
    };

    this.add =(username,password)=>{
        adduser(username,password);
    };

    this.search=(username,cc)=>{
        logger.info('Search:',username);
        finduser(username, function(rr){
            cc(rr.password);
        });
    };

    this.login=(login,password,ccc)=>{
        finduser(login, function(rr){
            logger.info('Начало поиска');
            if(rr){
                logger.info('Пользователь',login, 'найден,проверяем переданный пароль', password );
                if(password == rr.password){
                    logger.info('Авторизация', login,'успешна');
                    ccc(true);
                } else{
                    ccc(false);
                }} else{
                ccc(false);
            }});
    };

    this.get_ban=(login, cc)=>{
        knex('bans_list')
            .select('time_expired', 'reason')
            .where({
                'login_banned':login
            })
            .andWhere(
                'time_expired','>',new Date()
            )
            .orderBy('time_expired','desc')
            .limit(1)
            .then(function(rows){
                if (rows.length === 0) {
                    logger.info('незабанен');
                    cc();
                } else {
                    rows.map(item =>{
                        //logger.debug("редуцираем", item);
                        cc(item);
                    });
                }
            })
            .catch(function(e){
                logger.info('error in find user select',e);
            });
    };

    this.auth=(username,password,c)=>{

    };
};

module.exports.user = user;
